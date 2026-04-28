import express from 'express'
import { createHmrcMcpServer } from '@hmrc-sync/agent-skill'

const REQUEST_SIZE_LIMIT = process.env.REQUEST_SIZE_LIMIT ?? '100kb'
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000)
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 60)
const SLOW_REQUEST_THRESHOLD_MS = Number(process.env.SLOW_REQUEST_THRESHOLD_MS ?? 1_500)
const AUTH_MODE = process.env.AUTH_MODE ?? 'api_key'
const API_KEYS = new Set(
  (process.env.MCP_API_KEYS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
)
const OAUTH_BEARER_TOKENS = new Set(
  (process.env.OAUTH_BEARER_TOKENS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
)
const TENANT_POLICIES = parseTenantPolicies(process.env.TENANT_POLICIES_JSON)
const rateLimitState = new Map()

const app = express()
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }))

const mcp = createHmrcMcpServer()

function parseTenantPolicies(raw) {
  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    console.warn('Invalid TENANT_POLICIES_JSON. Falling back to empty policy set.')
    return {}
  }
}

function resolveApiKey(req) {
  const headerKey = req.get('x-api-key')
  if (headerKey) {
    return headerKey.trim()
  }

  return ''
}

function resolveBearerToken(req) {
  const authHeader = req.get('authorization')
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }

  return ''
}

function getAuthMode() {
  if (AUTH_MODE === 'api_key' || AUTH_MODE === 'oauth' || AUTH_MODE === 'api_key_or_oauth') {
    return AUTH_MODE
  }

  console.warn(`Invalid AUTH_MODE: ${AUTH_MODE}. Falling back to api_key.`)
  return 'api_key'
}

function apiKeyAuth(req, res, next) {
  const mode = getAuthMode()
  const hasApiKeyConfig = API_KEYS.size > 0
  const hasOauthConfig = OAUTH_BEARER_TOKENS.size > 0

  if (
    (mode === 'api_key' && !hasApiKeyConfig) ||
    (mode === 'oauth' && !hasOauthConfig) ||
    (mode === 'api_key_or_oauth' && !hasApiKeyConfig && !hasOauthConfig)
  ) {
    res.status(503).json({ ok: false, error: 'Authentication is not configured for current AUTH_MODE' })
    return
  }

  const apiKey = resolveApiKey(req)
  const bearerToken = resolveBearerToken(req)

  const apiKeyValid = hasApiKeyConfig && Boolean(apiKey) && API_KEYS.has(apiKey)
  const oauthValid = hasOauthConfig && Boolean(bearerToken) && OAUTH_BEARER_TOKENS.has(bearerToken)

  if (mode === 'api_key' && !apiKeyValid) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return
  }

  if (mode === 'oauth' && !oauthValid) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return
  }

  if (mode === 'api_key_or_oauth' && !apiKeyValid && !oauthValid) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return
  }

  req.apiKey = apiKeyValid ? apiKey : undefined
  req.oauthAuthenticated = oauthValid
  next()
}

function simpleRateLimit(req, res, next) {
  const now = Date.now()
  const subject = req.apiKey ?? req.ip ?? 'anonymous'
  const current = rateLimitState.get(subject)

  if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(subject, { count: 1, windowStart: now })
    next()
    return
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - current.windowStart)) / 1_000)
    res.set('Retry-After', String(Math.max(retryAfterSec, 1)))
    res.status(429).json({ ok: false, error: 'Rate limit exceeded' })
    return
  }

  current.count += 1
  next()
}

function resolveTenantId(req) {
  return req.get('x-tenant-id') ?? 'default'
}

function runTenantPolicyChecks(req, tool) {
  const tenantId = resolveTenantId(req)
  const tenantPolicy = TENANT_POLICIES[tenantId]

  if (!tenantPolicy) {
    return null
  }

  if (Array.isArray(tenantPolicy.allowedTools) && !tenantPolicy.allowedTools.includes(tool)) {
    return {
      tenantId,
      code: 'tool_not_allowed',
      message: `Tool ${tool} is not allowed for tenant ${tenantId}`
    }
  }

  return null
}

function shouldBlockForStrictGuardrails(req, result) {
  const tenantId = resolveTenantId(req)
  const tenantPolicy = TENANT_POLICIES[tenantId]

  if (!tenantPolicy?.strictGuardrails) {
    return false
  }

  return Boolean(result && Array.isArray(result.guardrailIssues) && result.guardrailIssues.length > 0)
}

function auditLog({ req, tool, status, durationMs }) {
  const entry = {
    timestamp: new Date().toISOString(),
    event: 'mcp_execute',
    path: req.path,
    tenantId: resolveTenantId(req),
    tool,
    status,
    durationMs
  }

  console.info(JSON.stringify(entry))
}

app.use((req, res, next) => {
  const startedAt = Date.now()

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt
    if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'slow_request',
          path: req.path,
          method: req.method,
          durationMs,
          statusCode: res.statusCode
        })
      )
    }

    if (res.statusCode >= 500) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'error_alert',
          path: req.path,
          method: req.method,
          statusCode: res.statusCode
        })
      )
    }
  })

  next()
})

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    uptimeSec: Math.round(process.uptime()),
    rateLimit: {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS
    }
  })
})

app.get(['/mcp/tools', '/v1/mcp/tools'], (_req, res) => {
  res.json({ tools: mcp.tools })
})

app.post(['/mcp/execute', '/v1/mcp/execute'], apiKeyAuth, simpleRateLimit, async (req, res) => {
  const startedAt = Date.now()
  let tool = 'unknown'

  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {}
    tool = payload.tool
    const input = payload.input

    if (!tool || typeof tool !== 'string') {
      auditLog({ req, tool: 'unknown', status: 'invalid_request', durationMs: Date.now() - startedAt })
      res.status(400).json({ ok: false, error: 'tool must be a non-empty string' })
      return
    }

    const policyError = runTenantPolicyChecks(req, tool)
    if (policyError) {
      auditLog({ req, tool, status: policyError.code, durationMs: Date.now() - startedAt })
      res.status(403).json({ ok: false, error: policyError.message })
      return
    }

    const result = await mcp.executeTool(tool, input ?? {})

    if (shouldBlockForStrictGuardrails(req, result)) {
      auditLog({ req, tool, status: 'guardrail_blocked', durationMs: Date.now() - startedAt })
      res.status(422).json({ ok: false, error: 'Blocked by strict guardrail policy' })
      return
    }

    auditLog({ req, tool, status: 'success', durationMs: Date.now() - startedAt })
    res.json({ ok: true, result })
  } catch (error) {
    auditLog({ req, tool, status: 'failed', durationMs: Date.now() - startedAt })
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown execution error'
    })
  }
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`MCP test server running on http://localhost:${port}`)
})

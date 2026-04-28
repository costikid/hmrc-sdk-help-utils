# Express MCP Test Backend

Express backend to expose `@hmrc-sync/agent-skill` tools over HTTP with production-shaped controls.

## Run

From repository root:

```bash
pnpm install
pnpm --filter express-mcp-test dev
```

Server starts on `http://localhost:3001` locally.

## Endpoints

- `GET /health`
- `GET /mcp/tools`
- `GET /v1/mcp/tools`
- `POST /mcp/execute` (API key required)
- `POST /v1/mcp/execute` (API key required)

## Security and controls

- Configurable auth on execute routes (`AUTH_MODE`): API key, OAuth bearer token, or either
- Request body size limit via `REQUEST_SIZE_LIMIT` (default: `100kb`)
- In-memory rate limiting via `RATE_LIMIT_WINDOW_MS` + `RATE_LIMIT_MAX_REQUESTS`
- Structured audit logs for tool execution (`tool`, `status`, `durationMs`, `tenantId`)
- Slow request + server error alerts in logs (for SLA/error monitoring hooks)
- Optional tenant policies via `TENANT_POLICIES_JSON`

## Environment variables

```bash
PORT=3001
AUTH_MODE=api_key
MCP_API_KEYS=dev-key-1,dev-key-2
OAUTH_BEARER_TOKENS=oauth-token-1,oauth-token-2
REQUEST_SIZE_LIMIT=100kb
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
SLOW_REQUEST_THRESHOLD_MS=1500
TENANT_POLICIES_JSON={"default":{"allowedTools":["hmrc.validate_headers"],"strictGuardrails":false}}
```

`AUTH_MODE` values:

- `api_key` (default): requires key from `MCP_API_KEYS`
- `oauth`: requires bearer token from `OAUTH_BEARER_TOKENS`
- `api_key_or_oauth`: accepts either valid API key or valid bearer token

For real production OAuth, replace static token checks with JWT verification/introspection against your IdP.

## Quick test

```bash
curl http://localhost:3001/v1/mcp/tools
```

```bash
curl -X POST http://localhost:3001/v1/mcp/execute \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key-1" \
  -d '{
    "tool": "hmrc.validate_headers",
    "input": {
      "method": "WEB_APP_VIA_SERVER",
      "headers": {
        "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
        "Gov-Client-Timezone": "UTC+00:00"
      }
    }
  }'
```

OAuth-mode example:

```bash
curl -X POST http://localhost:3001/v1/mcp/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oauth-token-1" \
  -d '{
    "tool": "hmrc.validate_headers",
    "input": {
      "method": "WEB_APP_VIA_SERVER",
      "headers": {
        "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
        "Gov-Client-Timezone": "UTC+00:00"
      }
    }
  }'
```

## Railway hosting notes

- Deploy this service to Railway and expose HTTPS at the public Railway URL.
- Railway handles TLS termination, so clients should call `https://<your-railway-domain>/v1/mcp/tools` and `https://<your-railway-domain>/v1/mcp/execute`.
- Find your Railway domain in the Railway dashboard under your service's "Domains" tab.
- Configure all environment variables in Railway service settings.
- For long-term production scale, replace in-memory limiter with Redis-backed rate limits using a library like `rate-limit-redis`.

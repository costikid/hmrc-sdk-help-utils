import {
  collectBrowserData,
  collectDesktopData,
  collectMobileData
} from '@hmrc-sync/collector'
import { validateHeaders } from '@hmrc-sync/engine'
import { prepareHmrcRequest } from '../prepare.js'
import { toConnectionMethod } from '../guardrails.js'
import type {
  BuildSubmissionInput,
  BuildSubmissionResult,
  CollectClientDataInput,
  GenerateHeadersInput,
  HmrcToolDefinition,
  SkillEnvironment,
  ValidateHeadersInput
} from '../types.js'

export const hmrcToolDefinitions: HmrcToolDefinition[] = [
  {
    name: 'hmrc.collect_client_data',
    description: 'Collect client data for browser, desktop, or mobile execution environments.',
    inputSchema: {
      type: 'object',
      properties: {
        environment: {
          type: 'string',
          enum: ['browser', 'desktop', 'mobile']
        }
      },
      required: ['environment']
    }
  },
  {
    name: 'hmrc.generate_headers',
    description: 'Generate HMRC fraud prevention headers from method, client data, and vendor config.',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string' },
        clientData: { type: 'object' },
        vendorConfig: { type: 'object' },
        serverIP: { type: 'string' },
        serverPort: { type: 'number' },
        requestMeta: { type: 'object' },
        explainMode: { type: 'boolean' }
      },
      required: ['method', 'clientData', 'vendorConfig']
    }
  },
  {
    name: 'hmrc.validate_headers',
    description: 'Validate generated headers for a specific HMRC connection method.',
    inputSchema: {
      type: 'object',
      properties: {
        headers: { type: 'object' },
        method: { type: 'string' }
      },
      required: ['headers', 'method']
    }
  },
  {
    name: 'hmrc.build_submission',
    description: 'Compose generate + validate + request template in a single tool call.',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string' },
        clientData: { type: 'object' },
        vendorConfig: { type: 'object' },
        serverIP: { type: 'string' },
        serverPort: { type: 'number' },
        requestMeta: { type: 'object' },
        explainMode: { type: 'boolean' },
        endpointUrl: { type: 'string' },
        payload: {}
      },
      required: ['method', 'clientData', 'vendorConfig']
    }
  }
]

function assertEnvironment(value: unknown): SkillEnvironment {
  if (value === 'browser' || value === 'desktop' || value === 'mobile') {
    return value
  }

  throw new Error('environment must be one of browser, desktop, or mobile')
}

export async function collectClientDataTool(input: CollectClientDataInput) {
  const environment = assertEnvironment(input.environment)

  switch (environment) {
    case 'browser':
      return collectBrowserData()
    case 'desktop':
      return collectDesktopData()
    case 'mobile':
      return collectMobileData()
  }
}

export function generateHeadersTool(input: GenerateHeadersInput) {
  return prepareHmrcRequest(input)
}

export function validateHeadersTool(input: ValidateHeadersInput) {
  return validateHeaders(input.headers, input.method)
}

export function buildSubmissionTool(input: BuildSubmissionInput): BuildSubmissionResult {
  const prepared = prepareHmrcRequest(input)

  if (!prepared.validation.valid || prepared.guardrailIssues.length > 0) {
    return {
      ...prepared,
      requestTemplate: null
    }
  }

  return {
    ...prepared,
    requestTemplate: {
      url: input.endpointUrl ?? 'https://api.service.hmrc.gov.uk/your-endpoint',
      method: 'POST',
      headers: {
        ...prepared.headers,
        Authorization: 'Bearer <access-token>',
        'Content-Type': 'application/json'
      },
      body: input.payload ?? {}
    }
  }
}

export async function executeHmrcTool(name: string, input: unknown): Promise<unknown> {
  switch (name) {
    case 'hmrc.collect_client_data':
      return collectClientDataTool(input as CollectClientDataInput)

    case 'hmrc.generate_headers': {
      const raw = input as GenerateHeadersInput & { method?: unknown }
      const method = toConnectionMethod(raw.method)
      if (!method) {
        throw new Error('method must be a valid ConnectionMethod value')
      }
      return generateHeadersTool({ ...raw, method })
    }

    case 'hmrc.validate_headers': {
      const raw = input as { headers?: Record<string, string>; method?: unknown }
      const method = toConnectionMethod(raw.method)
      if (!method || !raw.headers) {
        throw new Error('headers and valid method are required')
      }
      return validateHeadersTool({ headers: raw.headers, method })
    }

    case 'hmrc.build_submission': {
      const raw = input as BuildSubmissionInput & { method?: unknown }
      const method = toConnectionMethod(raw.method)
      if (!method) {
        throw new Error('method must be a valid ConnectionMethod value')
      }
      return buildSubmissionTool({ ...raw, method })
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export function createHmrcMcpServer() {
  return {
    tools: hmrcToolDefinitions,
    executeTool: executeHmrcTool
  }
}

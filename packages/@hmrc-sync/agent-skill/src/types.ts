import type { CollectedClientData } from '@hmrc-sync/collector'
import { ConnectionMethod, type HeaderValidationResult, type VendorConfig } from '@hmrc-sync/engine'

export type SkillEnvironment = 'browser' | 'desktop' | 'mobile'

export type RequestMeta = {
  executionContext?: 'browser' | 'backend' | 'agent' | 'unknown'
  submissionTarget?: 'hmrc' | 'backend' | 'unknown'
  integrationType?: 'web' | 'desktop' | 'mobile' | 'batch' | 'unknown'
}

export type PrepareHmrcRequestInput = {
  method: ConnectionMethod
  clientData: CollectedClientData
  vendorConfig: VendorConfig
  serverIP?: string
  serverPort?: number
  requestMeta?: RequestMeta
  explainMode?: boolean
}

export type SkillIssue = {
  code:
    | 'INVALID_CONNECTION_METHOD'
    | 'MISSING_SERVER_IP'
    | 'MISSING_SERVER_PORT'
    | 'BROWSER_DIRECT_HMRC_BLOCKED'
  message: string
  field?: string
  fix?: string
}

export type NextAction = {
  title: string
  description: string
}

export type RequestPlan = {
  shouldSubmitToHmrc: boolean
  recommendedTarget: 'backend' | 'hmrc'
  notes: string[]
}

export type PrepareHmrcRequestResult = {
  headers: Record<string, string>
  validation: HeaderValidationResult
  guardrailIssues: SkillIssue[]
  nextActions: NextAction[]
  requestPlan: RequestPlan
  explanation?: string
}

export type CollectClientDataInput = {
  environment: SkillEnvironment
}

export type GenerateHeadersInput = PrepareHmrcRequestInput

export type ValidateHeadersInput = {
  headers: Record<string, string>
  method: ConnectionMethod
}

export type BuildSubmissionInput = PrepareHmrcRequestInput & {
  endpointUrl?: string
  payload?: unknown
}

export type BuildSubmissionResult = PrepareHmrcRequestResult & {
  requestTemplate: {
    url: string
    method: 'POST'
    headers: Record<string, string>
    body: unknown
  } | null
}

export type HmrcMcpToolName =
  | 'hmrc.collect_client_data'
  | 'hmrc.generate_headers'
  | 'hmrc.validate_headers'
  | 'hmrc.build_submission'

export type HmrcToolDefinition = {
  name: HmrcMcpToolName
  description: string
  inputSchema: Record<string, unknown>
}

export { ConnectionMethod }

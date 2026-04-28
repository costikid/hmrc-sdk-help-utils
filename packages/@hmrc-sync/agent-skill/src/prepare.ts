import { ConnectionMethod, generateHeaders, validateHeaders, type EngineInput } from '@hmrc-sync/engine'
import { buildExplanation, buildNextActions } from './explain.js'
import { getGuardrailIssues, getRequestPlan } from './guardrails.js'
import type { PrepareHmrcRequestInput, PrepareHmrcRequestResult } from './types.js'

function toEngineInput(input: PrepareHmrcRequestInput): EngineInput {
  const { method, clientData, vendorConfig } = input

  switch (method) {
    case ConnectionMethod.WEB_APP_VIA_SERVER:
    case ConnectionMethod.DESKTOP_APP_VIA_SERVER:
    case ConnectionMethod.MOBILE_APP_VIA_SERVER:
      return {
        method,
        clientData,
        serverIP: input.serverIP as string,
        serverPort: input.serverPort as number,
        vendorConfig
      }

    case ConnectionMethod.DESKTOP_APP_DIRECT:
    case ConnectionMethod.MOBILE_APP_DIRECT:
    case ConnectionMethod.BATCH_PROCESS_DIRECT:
      return {
        method,
        clientData,
        vendorConfig
      }
  }

  throw new Error(`Unsupported connection method: ${method}`)
}

export function prepareHmrcRequest(input: PrepareHmrcRequestInput): PrepareHmrcRequestResult {
  const guardrailIssues = getGuardrailIssues(input)
  const engineInput = toEngineInput(input)

  const headers = guardrailIssues.length > 0
    ? {}
    : generateHeaders(engineInput)

  const validation = guardrailIssues.length > 0
    ? { valid: false, issues: [] }
    : validateHeaders(headers, input.method)

  const nextActions = buildNextActions(validation, guardrailIssues)
  const requestPlan = getRequestPlan(input, guardrailIssues)

  return {
    headers,
    validation,
    guardrailIssues,
    nextActions,
    requestPlan,
    explanation: input.explainMode
      ? buildExplanation(input.method, validation, guardrailIssues)
      : undefined
  }
}

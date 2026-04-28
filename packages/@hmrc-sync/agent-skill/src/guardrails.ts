import { ConnectionMethod } from '@hmrc-sync/engine'
import type { PrepareHmrcRequestInput, RequestPlan, SkillIssue } from './types.js'

const VIA_SERVER_METHODS = new Set<ConnectionMethod>([
  ConnectionMethod.WEB_APP_VIA_SERVER,
  ConnectionMethod.DESKTOP_APP_VIA_SERVER,
  ConnectionMethod.MOBILE_APP_VIA_SERVER
])

export function toConnectionMethod(value: unknown): ConnectionMethod | null {
  if (typeof value !== 'string') {
    return null
  }

  const validMethods = Object.values(ConnectionMethod) as string[]
  return validMethods.includes(value) ? (value as ConnectionMethod) : null
}

export function getGuardrailIssues(input: PrepareHmrcRequestInput): SkillIssue[] {
  const issues: SkillIssue[] = []

  if (VIA_SERVER_METHODS.has(input.method)) {
    if (!input.serverIP || input.serverIP.trim() === '') {
      issues.push({
        code: 'MISSING_SERVER_IP',
        field: 'serverIP',
        message: `${input.method} requires serverIP`,
        fix: 'Add the backend server public IP as serverIP.'
      })
    }

    if (typeof input.serverPort !== 'number' || Number.isNaN(input.serverPort)) {
      issues.push({
        code: 'MISSING_SERVER_PORT',
        field: 'serverPort',
        message: `${input.method} requires serverPort`,
        fix: 'Add the backend server public port as serverPort.'
      })
    }
  }

  if (
    input.requestMeta?.executionContext === 'browser' &&
    input.requestMeta?.submissionTarget === 'hmrc'
  ) {
    issues.push({
      code: 'BROWSER_DIRECT_HMRC_BLOCKED',
      message: 'Browser-originated direct HMRC submissions are blocked by policy.',
      fix: 'Post clientData to your backend and submit to HMRC from the backend only.'
    })
  }

  return issues
}

export function getRequestPlan(input: PrepareHmrcRequestInput, guardrailIssues: SkillIssue[]): RequestPlan {
  const notes: string[] = []

  if (guardrailIssues.some((issue) => issue.code === 'BROWSER_DIRECT_HMRC_BLOCKED')) {
    notes.push('Route requests through backend. Do not call HMRC directly from browser context.')
  }

  if (VIA_SERVER_METHODS.has(input.method)) {
    notes.push('This method requires serverIP and serverPort supplied by the backend.')
    return {
      shouldSubmitToHmrc: guardrailIssues.length === 0,
      recommendedTarget: 'backend',
      notes
    }
  }

  return {
    shouldSubmitToHmrc: guardrailIssues.length === 0,
    recommendedTarget: input.requestMeta?.submissionTarget === 'backend' ? 'backend' : 'hmrc',
    notes
  }
}

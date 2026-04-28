import { ConnectionMethod, type HeaderValidationResult } from '@hmrc-sync/engine'
import type { NextAction, SkillIssue } from './types.js'

export function buildNextActions(
  validation: HeaderValidationResult,
  guardrailIssues: SkillIssue[]
): NextAction[] {
  const actions: NextAction[] = []

  for (const issue of guardrailIssues) {
    actions.push({
      title: issue.code,
      description: issue.fix ?? issue.message
    })
  }

  for (const issue of validation.issues) {
    actions.push({
      title: `Fix ${issue.header}`,
      description: issue.reason
    })
  }

  if (actions.length === 0) {
    actions.push({
      title: 'Ready to submit',
      description: 'Headers are valid. Continue with backend-authenticated HMRC submission.'
    })
  }

  return actions
}

export function buildExplanation(
  method: ConnectionMethod,
  validation: HeaderValidationResult,
  guardrailIssues: SkillIssue[]
): string {
  if (guardrailIssues.length > 0) {
    return [
      `Blocked by ${guardrailIssues.length} guardrail check(s) for ${method}.`,
      ...guardrailIssues.map((issue) => `- ${issue.message}`)
    ].join('\n')
  }

  if (!validation.valid) {
    return [
      `Validation failed for ${method}.`,
      ...validation.issues.map((issue) => `- ${issue.header}: ${issue.reason}`)
    ].join('\n')
  }

  return `Headers are valid for ${method}.`
}

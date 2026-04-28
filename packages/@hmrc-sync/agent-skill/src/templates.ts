import { ConnectionMethod } from './types.js'
import type { BuildSubmissionInput, RequestMeta } from './types.js'

export type SkillTemplateName =
  | 'set-up-web-via-server'
  | 'set-up-desktop-direct'
  | 'validate-before-submit'

export type SkillTemplate = {
  name: SkillTemplateName
  title: string
  prompt: string
  starterInput: Partial<BuildSubmissionInput>
}

const sharedRequestMeta: RequestMeta = {
  executionContext: 'agent',
  submissionTarget: 'backend',
  integrationType: 'web'
}

export const skillTemplates: SkillTemplate[] = [
  {
    name: 'set-up-web-via-server',
    title: 'Set up web via server',
    prompt: 'Set up HMRC WEB_APP_VIA_SERVER with backend submission and validation.',
    starterInput: {
      method: ConnectionMethod.WEB_APP_VIA_SERVER,
      serverIP: '<your-server-ip>',
      serverPort: 8443,
      requestMeta: sharedRequestMeta
    }
  },
  {
    name: 'set-up-desktop-direct',
    title: 'Set up desktop direct',
    prompt: 'Set up HMRC DESKTOP_APP_DIRECT and generate valid headers.',
    starterInput: {
      method: ConnectionMethod.DESKTOP_APP_DIRECT,
      requestMeta: {
        executionContext: 'backend',
        submissionTarget: 'hmrc',
        integrationType: 'desktop'
      }
    }
  },
  {
    name: 'validate-before-submit',
    title: 'Validate headers before submit',
    prompt: 'Validate generated HMRC headers and provide exact fixes for each issue.',
    starterInput: {
      requestMeta: {
        executionContext: 'agent',
        submissionTarget: 'unknown',
        integrationType: 'unknown'
      },
      explainMode: true
    }
  }
]

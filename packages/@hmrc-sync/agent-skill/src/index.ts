export { prepareHmrcRequest } from './prepare.js'
export { skillTemplates } from './templates.js'
export {
  hmrcToolDefinitions,
  collectClientDataTool,
  generateHeadersTool,
  validateHeadersTool,
  buildSubmissionTool,
  executeHmrcTool,
  createHmrcMcpServer
} from './mcp/server.js'
export { startHmrcMcpStdioServer } from './mcp/stdio.js'

export {
  ConnectionMethod,
  type PrepareHmrcRequestInput,
  type PrepareHmrcRequestResult,
  type SkillIssue,
  type NextAction,
  type RequestPlan,
  type CollectClientDataInput,
  type BuildSubmissionInput,
  type BuildSubmissionResult,
  type HmrcToolDefinition,
  type HmrcMcpToolName,
  type SkillEnvironment,
  type RequestMeta
} from './types.js'

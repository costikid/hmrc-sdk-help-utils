import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { executeHmrcTool, hmrcToolDefinitions } from './server.js'

export async function startHmrcMcpStdioServer(): Promise<void> {
  const server = new Server(
    {
      name: '@hmrc-sync/agent-skill',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: hmrcToolDefinitions.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await executeHmrcTool(request.params.name, request.params.arguments ?? {})
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: error instanceof Error ? error.message : 'Unknown tool execution error'
          }
        ],
        isError: true
      }
    }
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

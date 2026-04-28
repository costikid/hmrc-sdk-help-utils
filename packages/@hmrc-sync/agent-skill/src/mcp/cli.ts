#!/usr/bin/env node
import { startHmrcMcpStdioServer } from './stdio.js'

startHmrcMcpStdioServer().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Failed to start MCP stdio server')
  process.exit(1)
})

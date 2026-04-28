# @hmrc-sync/agent-skill

MCP-first AI agent skill for HMRC fraud prevention header workflows.

## What this package provides

- High-level orchestration via `prepareHmrcRequest(...)`
- MCP-style tool handlers for collection, generation, validation, and submission planning
- Built-in guardrails for risky/invalid flows
- Explain mode for human-readable remediation guidance
- Starter templates for common integration intents

## Installation

```bash
pnpm add @hmrc-sync/agent-skill
```

## Core contract

```ts
import { prepareHmrcRequest, ConnectionMethod } from '@hmrc-sync/agent-skill'

const result = prepareHmrcRequest({
  method: ConnectionMethod.WEB_APP_VIA_SERVER,
  clientData,
  serverIP: '203.0.113.6',
  serverPort: 8443,
  vendorConfig: {
    productName: 'MyTaxProduct',
    version: { MyTaxProduct: '1.0.0' }
  },
  requestMeta: {
    executionContext: 'backend',
    submissionTarget: 'hmrc',
    integrationType: 'web'
  },
  explainMode: true
})

console.log(result.headers)
console.log(result.validation)
console.log(result.nextActions)
```

## Tool catalog

- `hmrc.collect_client_data(environment)`
- `hmrc.generate_headers(...)`
- `hmrc.validate_headers(...)`
- `hmrc.build_submission(...)`

Use `createHmrcMcpServer()` to expose tool definitions and an `executeTool(...)` handler.

## Real MCP stdio server

This package also provides a real MCP stdio transport server for MCP-native clients.

Run it directly:

```bash
pnpm --filter @hmrc-sync/agent-skill build
pnpm --filter @hmrc-sync/agent-skill mcp:stdio
```

Or via binary after install:

```bash
hmrc-agent-skill-mcp
```

Programmatic start:

```ts
import { startHmrcMcpStdioServer } from '@hmrc-sync/agent-skill'

await startHmrcMcpStdioServer()
```

## Guardrails

The skill enforces non-negotiable checks:

- `*_VIA_SERVER` methods require `serverIP` and `serverPort`
- Browser-originated direct HMRC submissions are blocked by policy checks
- Invalid method values are rejected before execution

## Explain mode

When `explainMode: true`, responses include a concise human explanation of:

- what failed
- why it failed
- what to change next

## Starter templates

`skillTemplates` includes built-in intent templates:

- Set up web via server
- Set up desktop direct
- Validate before submit

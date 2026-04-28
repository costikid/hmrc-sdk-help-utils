# @hmrc-sync/agent-skill

HMRC Fraud Prevention Headers SDK and API for generating, validating, and submitting HMRC-compliant headers.

## Two ways to use this library

**1. SDK (embed in your codebase)**
- Install the package and use it directly in your Node.js/TypeScript project
- Full control over execution, runs locally in your app
- Best for: applications that want to embed the logic

**2. HTTP API (hosted service)**
- Call the hosted API over HTTPS — no installation required
- Managed service with auth, rate limiting, and audit logging
- Best for: partners who want a simple hosted service without installing anything

---

## 1. SDK Usage

### Installation

```bash
pnpm add @hmrc-sync/agent-skill
```

### Core contract

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

### Tool catalog

- `hmrc.collect_client_data(environment)`
- `hmrc.generate_headers(...)`
- `hmrc.validate_headers(...)`
- `hmrc.build_submission(...)`

Use `createHmrcMcpServer()` to expose tool definitions and an `executeTool(...)` handler.

### MCP stdio server (for chat interfaces)

This package also provides a real MCP stdio transport server for MCP-native clients like Cursor, Windsurf, or Claude Desktop.

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

---

## 2. HTTP API Usage

### API endpoint

```
https://hmrc-sdk-help-utils-production.up.railway.app
```

### Authentication

Include your API key in the request header:

```
x-api-key: YOUR_API_KEY
```

Or use OAuth bearer token:

```
Authorization: Bearer YOUR_TOKEN
```

### Endpoints

#### Get available tools

```bash
curl https://hmrc-sdk-help-utils-production.up.railway.app/v1/mcp/tools
```

#### Execute a tool

```bash
curl -X POST https://hmrc-sdk-help-utils-production.up.railway.app/v1/mcp/execute \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "tool": "hmrc.validate_headers",
    "input": {
      "method": "WEB_APP_VIA_SERVER",
      "headers": {
        "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
        "Gov-Client-Timezone": "UTC+00:00"
      }
    }
  }'
```

### Example integration (JavaScript)

```javascript
const API_URL = 'https://hmrc-sdk-help-utils-production.up.railway.app'
const API_KEY = 'your-api-key'

async function validateHeaders(headers) {
  const response = await fetch(`${API_URL}/v1/mcp/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      tool: 'hmrc.validate_headers',
      input: {
        method: 'WEB_APP_VIA_SERVER',
        headers: headers
      }
    })
  })

  const result = await response.json()
  return result
}
```

---

## Features

- High-level orchestration via `prepareHmrcRequest(...)`
- MCP-style tool handlers for collection, generation, validation, and submission planning
- Built-in guardrails for risky/invalid flows
- Explain mode for human-readable remediation guidance
- Starter templates for common integration intents

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

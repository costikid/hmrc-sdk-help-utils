# HMRC Fraud Prevention Headers SDK and API

A TypeScript SDK and hosted HTTP API for generating, validating, and submitting HMRC-compliant fraud prevention headers.

## Overview

This monorepo contains:

- **`@hmrc-sync/engine`** — Core header generation and validation logic
- **`@hmrc-sync/collector`** — Client-side data collection utilities
- **`@hmrc-sync/agent-skill`** — High-level orchestration and MCP tool handlers
- **`examples/express-mcp-test`** — Production-shaped HTTP API wrapper (deployed to Railway)

## Two ways to use

**1. SDK (embed in your codebase)**
- Install the packages and use them directly in your Node.js/TypeScript project
- Full control over execution, runs locally in your app
- See [`packages/@hmrc-sync/agent-skill/README.md`](packages/@hmrc-sync/agent-skill/README.md) for SDK usage

**2. HTTP API (hosted service)**
- Call the hosted API over HTTPS — no installation required
- Managed service with auth, rate limiting, and audit logging
- See [`packages/@hmrc-sync/agent-skill/README.md`](packages/@hmrc-sync/agent-skill/README.md) for HTTP API usage

## Quick start

### SDK usage

```bash
pnpm add @hmrc-sync/agent-skill
```

```typescript
import { prepareHmrcRequest, ConnectionMethod } from '@hmrc-sync/agent-skill'
import { collectBrowserData } from '@hmrc-sync/collector'

const clientData = await collectBrowserData()
const result = prepareHmrcRequest({
  method: ConnectionMethod.WEB_APP_VIA_SERVER,
  clientData,
  serverIP: 'your-server-ip',
  serverPort: 443,
  vendorConfig: {
    productName: 'MyProduct',
    version: { MyProduct: '1.0.0' }
  }
})
```

### HTTP API usage

```bash
curl https://hmrc-sdk-help-utils-production.up.railway.app/v1/mcp/tools
```

See the [agent-skill README](packages/@hmrc-sync/agent-skill/README.md) for full HTTP API documentation.

## Packages

| Package | Description |
|---------|-------------|
| [`@hmrc-sync/engine`](packages/@hmrc-sync/engine) | Server-side header generation and validation |
| [`@hmrc-sync/collector`](packages/@hmrc-sync/collector) | Client-side data collection |
| [`@hmrc-sync/agent-skill`](packages/@hmrc-sync/agent-skill) | High-level orchestration and MCP tools |

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run tests
pnpm -r test

# Run the HTTP API example
pnpm --filter express-mcp-test dev
```

## License

MIT

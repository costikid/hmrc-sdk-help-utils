# HMRC Fraud Prevention Headers SDK and API

A TypeScript SDK and hosted HTTP API for generating, validating, and submitting HMRC-compliant fraud prevention headers.

## Overview

This monorepo contains:

- **`@hmrc-sync/engine`** — Core header generation and validation logic

  **When to use [@hmrc-sync/engine](packages/@hmrc-sync/engine):**

  - **Server-side header generation** - When you need to generate HMRC fraud prevention headers on your server before making API calls to HMRC
  - **Header validation** - When you want to validate headers before sending them to HMRC APIs
  - **Via Server connection methods** - When using `WEB_APP_VIA_SERVER`, `DESKTOP_APP_VIA_SERVER`, or `MOBILE_APP_VIA_SERVER` (client sends data to your server, your server appends server info and generates headers)

  **Why use it:**

  - **Type safety** - Uses TypeScript discriminated unions to ensure only valid fields are included for each connection method at compile time
  - **Supports all 6 HMRC connection methods** - `DESKTOP_APP_DIRECT`, `DESKTOP_APP_VIA_SERVER`, `WEB_APP_VIA_SERVER`, `MOBILE_APP_DIRECT`, `MOBILE_APP_VIA_SERVER`, `BATCH_PROCESS_DIRECT`
  - **Structured error handling** - `validateHeaders()` never throws, returns structured validation results with British English error messages
  - **VPN/proxy handling** - Accurately reports network topology including VPNs and proxies without attempting to detect or circumvent them

  **Typical flow:**
  1. Client collects data via [@hmrc-sync/collector](packages/@hmrc-sync/collector)
  2. Client POSTs data to your server
  3. Your server uses [@hmrc-sync/engine](packages/@hmrc-sync/engine) to merge with server IP/port and generate headers
  4. Attach headers to HMRC API request
- **`@hmrc-sync/collector`** — Client-side data collection utilities

  **When to use [@hmrc-sync/collector](packages/@hmrc-sync/collector):**

  - **Browser environments** - Use `collectBrowserData()` when building web applications (for `WEB_APP_VIA_SERVER` or `MOBILE_APP_VIA_SERVER` connection methods)
  - **Desktop/Node.js environments** - Use `collectDesktopData()` when building desktop applications (for `DESKTOP_APP_DIRECT` or `DESKTOP_APP_VIA_SERVER` connection methods)
  - **Mobile environments** - Use `collectMobileData()` when building mobile apps (for `MOBILE_APP_DIRECT` or `MOBILE_APP_VIA_SERVER` connection methods)

  **Why use it:**

  - **Collects required client data** - Gathers device info, screen data, timezone, local IPs, MAC addresses, and other data needed for HMRC fraud prevention headers
  - **Environment-specific** - Each function collects data appropriate for its environment (browser vs desktop vs mobile)
  - **Silent failure handling** - All failures return `""` or `[]` per HMRC's "silent rule" - never throws errors
  - **Type safety** - Returns complete `CollectedClientData` objects with all fields present

  **Typical flow:**
  1. Client calls appropriate collection function based on environment
  2. Client sends collected data to your server (for VIA_SERVER methods)
  3. Server uses [@hmrc-sync/engine](packages/@hmrc-sync/engine) to merge with server info and generate headers
  4. Attach headers to HMRC API request

  **Data collected:**
  - Screen dimensions, scaling factor, colour depth
  - Timezone
  - User agent (browser only)
  - Local IPs and MAC addresses (desktop only)
  - Device ID
  - OS info (desktop only)
  - Window size
- **`@hmrc-sync/agent-skill`** — High-level orchestration and MCP tool handlers

  **When to use [@hmrc-sync/agent-skill](packages/@hmrc-sync/agent-skill):**

  - **High-level orchestration** - When you want a simple `prepareHmrcRequest()` function that handles the entire workflow (collect → generate → validate → plan submission) in one call
  - **AI/agent integrations** - When building AI agents or chat interfaces that need MCP (Model Context Protocol) tool handlers for HMRC header workflows
  - **Guardrails and validation** - When you need built-in policy checks (e.g., blocking browser-originated direct HMRC submissions, enforcing required fields for VIA_SERVER methods)
  - **Human-readable guidance** - When you want `explainMode` to provide clear remediation steps when validation fails
  - **Starter templates** - When you want pre-built intent templates for common integration patterns (web via server, desktop direct, validate before submit)

  **Two usage modes:**

  1. **SDK (embed in your codebase)** - Install and use directly in your Node.js/TypeScript project for full control
  2. **HTTP API (hosted service)** - Call the hosted API over HTTPS with auth, rate limiting, and audit logging

  **MCP stdio server:**
  - Use when integrating with MCP-native clients like Cursor, Windsurf, or Claude Desktop
  - Run via `pnpm --filter @hmrc-sync/agent-skill mcp:stdio` or `npx hmrc-agent-skill-mcp`

  **Tool catalog:**
  - `hmrc.collect_client_data(environment)`
  - `hmrc.generate_headers(...)`
  - `hmrc.validate_headers(...)`
  - `hmrc.build_submission(...)`

  **Why use it instead of lower-level packages:**
  - Simpler API - one function call instead of coordinating collector + engine
  - Built-in guardrails and policy enforcement
  - MCP-ready for AI agent integration
  - Explain mode for debugging and user guidance
- **[`examples/express-mcp-server`](examples/express-mcp-server)** — Reference HTTP API implementation with auth, rate limiting, and audit logging

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
pnpm --filter express-mcp-server dev
```

## License

MIT

# @hmrc-sync/engine

Server-side header generation and validation for HMRC Fraud Prevention Headers.

## Overview

This package generates and validates HMRC fraud prevention headers based on collected client data and the selected connection method. It enforces type safety at compile time using discriminated unions to ensure only valid fields are included for each connection method.

## Installation

```bash
pnpm add @hmrc-sync/engine
```

## Usage

### Generate Headers

```typescript
import { generateHeaders, ConnectionMethod } from '@hmrc-sync/engine'
import { collectBrowserData } from '@hmrc-sync/collector'

// Collect client data
const clientData = await collectBrowserData()

// Construct input for WEB_APP_VIA_SERVER
const input = {
  method: ConnectionMethod.WEB_APP_VIA_SERVER,
  clientData,
  serverIP: '203.0.113.6',
  serverPort: 443
}

// Generate headers
const headers = generateHeaders(input)

// Attach to HMRC API request
const response = await fetch('https://api.service.hmrc.gov.uk/your-endpoint', {
  headers,
  method: 'POST',
  body: JSON.stringify(yourPayload)
})
```

### Validate Headers

```typescript
import { validateHeaders, ConnectionMethod } from '@hmrc-sync/engine'

const headers = {
  'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
  'Gov-Client-Timezone': 'UTC+00:00',
  // ... other headers
}

const result = validateHeaders(headers, ConnectionMethod.WEB_APP_VIA_SERVER)

if (!result.valid) {
  console.error('Validation failed:', result.issues)
} else {
  console.log('Headers are valid')
}
```

## Via Server Merge Pattern

For all `VIA_SERVER` methods, the server must append its own data after receiving `CollectedClientData` from the client:

1. Client calls `collectBrowserData()` / `collectDesktopData()`
2. Client POSTs `CollectedClientData` as JSON to your server endpoint
3. Server receives it, constructs the correct `EngineInput` type
4. Server appends `serverIP` and `serverPort`
5. Server calls `generateHeaders(input)` and attaches the result to the HMRC API request

## Connection Methods

The engine supports all six HMRC connection methods:

- `DESKTOP_APP_DIRECT` - Desktop application connecting directly to HMRC
- `DESKTOP_APP_VIA_SERVER` - Desktop application connecting via intermediary servers
- `WEB_APP_VIA_SERVER` - Web application connecting via intermediary servers
- `MOBILE_APP_DIRECT` - Mobile application connecting directly to HMRC
- `MOBILE_APP_VIA_SERVER` - Mobile application connecting via intermediary servers
- `BATCH_PROCESS_DIRECT` - Batch process connecting directly to HMRC

## Type Safety

The engine uses TypeScript discriminated unions to enforce which fields are required and forbidden for each connection method at compile time. This prevents sending incorrect headers for a given method.

## VPN and Proxy Handling

VPNs and proxies are legitimate network infrastructure and should be reflected accurately in the headers:

- **Gov-Client-Public-IP**: Report the IP that makes the request (VPN exit node if applicable)
- **Gov-Client-Local-IPs**: Include all network interfaces, including VPN virtual interfaces
- **Gov-Client-MAC-Addresses**: Include all MAC addresses the OS reports
- **Gov-Vendor-Forwarded**: Track the actual hop chain, including VPNs if present

The SDK does not attempt to detect or circumvent VPNs - it simply reports the network topology as it exists.

## Error Handling

The engine's `validateHeaders()` function never throws - it always returns a structured `HeaderValidationResult` with British English error messages. This allows you to handle validation errors gracefully in your application.

## License

MIT

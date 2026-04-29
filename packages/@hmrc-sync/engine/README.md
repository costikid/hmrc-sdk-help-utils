# @hmrc-sync/engine

Server-side header generation and validation for HMRC Fraud Prevention Headers.

## Installation

```bash
npm install @hmrc-sync/engine
```

## Usage

### Generate Headers

```typescript
import { generateHeaders, ConnectionMethod } from '@hmrc-sync/engine'

const input = {
  method: ConnectionMethod.WEB_APP_VIA_SERVER,
  clientData: {
    userAgent: 'Mozilla/5.0',
    browserJsUserAgent: 'Mozilla/5.0',
    timezone: 'UTC+00:00',
    localIPs: ['192.168.1.10'],
    publicIP: '203.0.113.10',
    macAddresses: ['00:11:22:33:44:55'],
    deviceId: '550e8400-e29b-41d4-a716-446655440000'
  },
  serverIP: '203.0.113.6',
  serverPort: 443
}

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

## For more details

See the [root README](../../README.md) for:
- When to use this package vs others
- Why use it (type safety, connection methods, error handling, VPN handling)
- Typical integration flow

## License

MIT

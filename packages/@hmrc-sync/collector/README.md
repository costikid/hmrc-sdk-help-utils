# @hmrc-sync/collector

Client-side data collection for HMRC Fraud Prevention Headers.

## Installation

```bash
npm install @hmrc-sync/collector
```

## Usage

### Browser Environment

```typescript
import { collectBrowserData } from '@hmrc-sync/collector'

const clientData = await collectBrowserData()

// Send to your server for header generation
await fetch('/api/hmrc-client-data', {
  method: 'POST',
  body: JSON.stringify(clientData)
})
```

### Desktop/Node.js Environment

```typescript
import { collectDesktopData } from '@hmrc-sync/collector'

const clientData = await collectDesktopData()

// Send to your server for header generation
await fetch('/api/hmrc-client-data', {
  method: 'POST',
  body: JSON.stringify(clientData)
})
```

### Mobile Environment

```typescript
import { collectMobileData } from '@hmrc-sync/collector'

const clientData = await collectMobileData()

// Send to your server for header generation
await fetch('/api/hmrc-client-data', {
  method: 'POST',
  body: JSON.stringify(clientData)
})
```

## For more details

See the [root README](../../README.md) for:
- When to use this package vs others
- Why use it (environment-specific collection, silent failure handling, type safety)
- Data collected per environment
- Typical integration flow

## License

MIT

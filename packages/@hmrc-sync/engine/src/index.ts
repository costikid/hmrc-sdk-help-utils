/**
 * @hmrc-sync/engine
 * 
 * Server-side header generation and validation for HMRC Fraud Prevention Headers
 * 
 * This package generates and validates HMRC fraud prevention headers based on
 * collected client data and the selected connection method.
 * 
 * @packageDocumentation
 */

export { generateHeaders } from './generate.js'
export { validateHeaders } from './validate.js'

export {
  ConnectionMethod,
  type EngineInput,
  type VendorConfig,
  type WebAppViaServerInput,
  type DesktopAppDirectInput,
  type DesktopAppViaServerInput,
  type MobileAppDirectInput,
  type MobileAppViaServerInput,
  type BatchProcessDirectInput,
  type HeaderValidationResult
} from './types.js'

export { percentEncode, encodeList, encodeKeyValue, encodeKeyValuePairs } from './utils/encoding.js'

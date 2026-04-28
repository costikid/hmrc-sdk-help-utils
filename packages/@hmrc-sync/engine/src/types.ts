import type { CollectedClientData, MultiFactorFactor } from '@hmrc-sync/collector'

/**
 * Connection Method Enum
 *
 * The HMRC connection methods for fraud prevention headers.
 * Includes the six valid methods defined by HMRC.
 */
export enum ConnectionMethod {
  DESKTOP_APP_DIRECT = 'DESKTOP_APP_DIRECT',
  DESKTOP_APP_VIA_SERVER = 'DESKTOP_APP_VIA_SERVER',
  WEB_APP_VIA_SERVER = 'WEB_APP_VIA_SERVER',
  MOBILE_APP_DIRECT = 'MOBILE_APP_DIRECT',
  MOBILE_APP_VIA_SERVER = 'MOBILE_APP_VIA_SERVER',
  BATCH_PROCESS_DIRECT = 'BATCH_PROCESS_DIRECT',
}

/**
 * Web Application Via Server Input
 * 
 * For web applications connecting to HMRC through intermediary servers.
 * Browser fields required, MAC addresses and OS info forbidden.
 */
export type WebAppViaServerInput = {
  method: ConnectionMethod.WEB_APP_VIA_SERVER
  clientData: CollectedClientData
  serverIP: string
  serverPort: number
  vendorConfig: VendorConfig
}

/**
 * Desktop Application Direct Input
 * 
 * For desktop applications connecting directly to HMRC.
 * MAC addresses, deviceId, OS info required.
 * No serverIP or serverPort (direct connection).
 * Browser plugins, browser JS user agent forbidden.
 */
export type DesktopAppDirectInput = {
  method: ConnectionMethod.DESKTOP_APP_DIRECT
  clientData: CollectedClientData
  vendorConfig: VendorConfig
}

/**
 * Desktop Application Via Server Input
 * 
 * For desktop applications connecting to HMRC through intermediary servers.
 * MAC addresses, deviceId, OS info required.
 * Server appends serverIP and serverPort.
 */
export type DesktopAppViaServerInput = {
  method: ConnectionMethod.DESKTOP_APP_VIA_SERVER
  clientData: CollectedClientData
  serverIP: string
  serverPort: number
  vendorConfig: VendorConfig
}

/**
 * Mobile Application Direct Input
 * 
 * For mobile applications connecting directly to HMRC.
 * Device ID required.
 * No serverIP or serverPort (direct connection).
 */
export type MobileAppDirectInput = {
  method: ConnectionMethod.MOBILE_APP_DIRECT
  clientData: CollectedClientData
  vendorConfig: VendorConfig
}

/**
 * Mobile Application Via Server Input
 * 
 * For mobile applications connecting to HMRC through intermediary servers.
 * Device ID required.
 * Server appends serverIP and serverPort.
 */
export type MobileAppViaServerInput = {
  method: ConnectionMethod.MOBILE_APP_VIA_SERVER
  clientData: CollectedClientData
  serverIP: string
  serverPort: number
  vendorConfig: VendorConfig
}

/**
 * Batch Process Direct Input
 *
 * For batch processes connecting directly to HMRC.
 * MAC addresses, deviceId, timezone required.
 * No screens, browser plugins, or browser JS user agent.
 * No serverIP or serverPort (direct connection).
 */
export type BatchProcessDirectInput = {
  method: ConnectionMethod.BATCH_PROCESS_DIRECT
  clientData: CollectedClientData
  vendorConfig: VendorConfig
}

/**
 * Vendor Configuration
 *
 * Application-specific details provided by the vendor.
 */
export interface VendorConfig {
  productName: string
  version: Record<string, string> // Key-value: <software-name>=<version-number>
  licenseIDs?: Record<string, string> // Key-value: <software-name>=<hashed-license-value>
  userIDs?: string
  multiFactor?: MultiFactorFactor[]
}

/**
 * Engine Input Discriminated Union
 *
 * TypeScript enforces which fields are required and forbidden for each connection method.
 */
export type EngineInput =
  | WebAppViaServerInput
  | DesktopAppDirectInput
  | DesktopAppViaServerInput
  | MobileAppDirectInput
  | MobileAppViaServerInput
  | BatchProcessDirectInput

/**
 * Header Validation Result
 * 
 * Structured validation result with British English error messages.
 */
export interface HeaderValidationResult {
  valid: boolean
  issues: Array<{
    header: string
    value: string
    reason: string
  }>
}

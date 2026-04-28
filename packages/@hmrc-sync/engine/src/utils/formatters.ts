import { percentEncode, encodeList, encodeKeyValue, encodeKeyValuePairs } from './encoding.js'
import type { CollectedClientData, MultiFactorFactor } from '@hmrc-sync/collector'

/**
 * Header Value Formatters
 *
 * Format client data into HMRC header values according to specification.
 */

/**
 * Format local IPs as comma-separated list with percent-encoding
 * IPv6 addresses must be percent-encoded, IPv4 addresses do not need encoding
 * but we encode all values for consistency.
 */
export function formatLocalIPs(localIPs: string[]): string {
  if (!localIPs || localIPs.length === 0) {
    return ''
  }

  // Encode IPv6 addresses (contain colons), leave IPv4 as-is per HMRC spec
  return localIPs.map(ip => {
    if (ip.includes(':')) {
      return percentEncode(ip)
    }
    return ip
  }).join(',')
}

/**
 * Format MAC addresses as comma-separated list with percent-encoding
 * MAC addresses contain colons, so they must be percent-encoded.
 */
export function formatMacAddresses(macAddresses: string[]): string {
  if (!macAddresses || macAddresses.length === 0) {
    return ''
  }
  
  return macAddresses.map(percentEncode).join(',')
}

/**
 * Format browser plugins as comma-separated list with percent-encoding
 */
export function formatBrowserPlugins(plugins: string[]): string {
  return encodeList(plugins)
}

/**
 * Format screens as key-value structure: width=1920&height=1080&scaling-factor=1&colour-depth=16
 * Multiple screens separated by commas.
 */
export function formatScreens(screens: Array<{width: string, height: string, scalingFactor: string, colourDepth: string}>): string {
  if (!screens || screens.length === 0) {
    return ''
  }
  
  return screens.map(screen =>
    encodeKeyValuePairs({
      'width': screen.width,
      'height': screen.height,
      'scaling-factor': screen.scalingFactor,
      'colour-depth': screen.colourDepth
    })
  ).join(',')
}

/**
 * Format timezone as UTC±HH:MM
 * Assumes input is already in correct format.
 */
export function formatTimezone(timezone: string): string {
  return timezone
}

/**
 * Format user agent as key-value structure: os-family=Windows&os-version=10&device-manufacturer=Dell&device-model=XPS13
 */
export function formatUserAgent(osFamily: string, osVersion: string, deviceManufacturer: string, deviceModel: string): string {
  return encodeKeyValuePairs({
    'os-family': osFamily,
    'os-version': osVersion,
    'device-manufacturer': deviceManufacturer,
    'device-model': deviceModel
  })
}

/**
 * Format user IDs as key-value structure: os=domain%5Calice&my-application=alice123
 */
export function formatUserIDs(userIDs: string): string {
  // userIDs is expected to be a pre-formatted key-value string
  // If it's empty, return empty string
  return userIDs || ''
}

/**
 * Format window size as key-value structure: width=1256&height=803
 */
export function formatWindowSize(windowWidth: string, windowHeight: string): string {
  return encodeKeyValuePairs({
    'width': windowWidth,
    'height': windowHeight
  })
}

/**
 * Format multi-factor authentication data as key-value structure
 * Multiple factors separated by commas.
 * Format: type=<type>&timestamp=<timestamp>&unique-reference=<reference>
 */
export function formatMultiFactor(multiFactor: MultiFactorFactor[]): string {
  if (!multiFactor || multiFactor.length === 0) {
    return ''
  }

  return multiFactor.map(factor =>
    encodeKeyValuePairs({
      'type': factor.type,
      'timestamp': factor.timestamp,
      'unique-reference': factor.uniqueReference
    })
  ).join(',')
}

/**
 * Format vendor forwarded as key-value structure: by=203.0.113.6&for=198.51.100.0
 * Multiple hops separated by commas.
 */
export function formatVendorForwarded(hops: Array<{by: string, for: string}>): string {
  if (!hops || hops.length === 0) {
    return ''
  }
  
  return hops.map(hop =>
    encodeKeyValuePairs({
      'by': hop.by,
      'for': hop.for
    })
  ).join(',')
}

/**
 * Format vendor license IDs as key-value structure: <software-name>=<hashed-license-value>
 * Multiple licenses separated by ampersands.
 */
export function formatVendorLicenseIDs(licenseIDs: Record<string, string>): string {
  if (!licenseIDs || Object.keys(licenseIDs).length === 0) {
    return ''
  }

  return encodeKeyValuePairs(licenseIDs)
}

/**
 * Format vendor version as key-value structure: <software-name>=<version-number>
 * Multiple versions separated by ampersands.
 */
export function formatVendorVersion(version: Record<string, string>): string {
  if (!version || Object.keys(version).length === 0) {
    return ''
  }

  return encodeKeyValuePairs(version)
}

/**
 * Extract screen data from CollectedClientData
 */
export function extractScreenData(clientData: CollectedClientData): Array<{width: string, height: string, scalingFactor: string, colourDepth: string}> {
  return [{
    width: clientData.screenWidth,
    height: clientData.screenHeight,
    scalingFactor: clientData.scalingFactor,
    colourDepth: clientData.colourDepth
  }]
}

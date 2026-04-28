import type { EngineInput } from './types.js'
import { ConnectionMethod } from './types.js'
import {
  formatLocalIPs,
  formatMacAddresses,
  formatBrowserPlugins,
  formatScreens,
  formatTimezone,
  formatUserAgent,
  formatUserIDs,
  formatWindowSize,
  formatMultiFactor,
  formatVendorForwarded,
  formatVendorLicenseIDs,
  formatVendorVersion,
  extractScreenData
} from './utils/formatters.js'

/**
 * Generate HMRC Fraud Prevention Headers
 *
 * Takes discriminated union input and returns a flat Record<string, string>
 * with HMRC header names as keys. Headers that don't apply to the selected
 * connection method are omitted entirely.
 *
 * @param input - EngineInput discriminated union
 * @returns Record<string, string> with HMRC header names
 */
export function generateHeaders(input: EngineInput): Record<string, string> {
  const headers: Record<string, string> = {}
  const { method, clientData, vendorConfig } = input

  // Always include connection method
  headers['Gov-Client-Connection-Method'] = method

  // Device ID (required for all methods)
  if (clientData.deviceId) {
    headers['Gov-Client-Device-ID'] = clientData.deviceId
  }

  // Method-specific headers
  switch (method) {
    case ConnectionMethod.WEB_APP_VIA_SERVER:
      generateWebAppViaServerHeaders(input, headers)
      break
    case ConnectionMethod.DESKTOP_APP_DIRECT:
      generateDesktopAppDirectHeaders(input, headers)
      break
    case ConnectionMethod.DESKTOP_APP_VIA_SERVER:
      generateDesktopAppViaServerHeaders(input, headers)
      break
    case ConnectionMethod.MOBILE_APP_DIRECT:
      generateMobileAppDirectHeaders(input, headers)
      break
    case ConnectionMethod.MOBILE_APP_VIA_SERVER:
      generateMobileAppViaServerHeaders(input, headers)
      break
    case ConnectionMethod.BATCH_PROCESS_DIRECT:
      generateBatchProcessDirectHeaders(input, headers)
      break
  }

  return headers
}

/**
 * Generate headers for WEB_APP_VIA_SERVER
 */
function generateWebAppViaServerHeaders(input: EngineInput, headers: Record<string, string>): void {
  const { clientData, vendorConfig } = input
  const viaServerInput = input as Extract<EngineInput, { serverIP: string; serverPort: number }>

  // Browser JS User Agent
  if (clientData.browserJSUserAgent) {
    headers['Gov-Client-Browser-JS-User-Agent'] = clientData.browserJSUserAgent
  }

  // Multi-Factor
  if (vendorConfig.multiFactor && vendorConfig.multiFactor.length > 0) {
    const multiFactorFormatted = formatMultiFactor(vendorConfig.multiFactor)
    if (multiFactorFormatted) {
      headers['Gov-Client-Multi-Factor'] = multiFactorFormatted
    }
  }

  // Public IP (server-side)
  if (viaServerInput.serverIP) {
    headers['Gov-Client-Public-IP'] = viaServerInput.serverIP
  }

  // Public IP Timestamp (current time)
  headers['Gov-Client-Public-IP-Timestamp'] = new Date().toISOString()

  // Public Port
  if (viaServerInput.serverPort) {
    headers['Gov-Client-Public-Port'] = String(viaServerInput.serverPort)
  }

  // Screens
  const screenData = extractScreenData(clientData)
  const screensFormatted = formatScreens(screenData)
  if (screensFormatted) {
    headers['Gov-Client-Screens'] = screensFormatted
  }

  // Timezone
  if (clientData.timezone) {
    headers['Gov-Client-Timezone'] = formatTimezone(clientData.timezone)
  }

  // User IDs
  if (clientData.userIDs) {
    headers['Gov-Client-User-IDs'] = formatUserIDs(clientData.userIDs)
  }

  // Window Size
  if (clientData.windowWidth && clientData.windowHeight) {
    headers['Gov-Client-Window-Size'] = formatWindowSize(clientData.windowWidth, clientData.windowHeight)
  }

  // Vendor Forwarded
  if (viaServerInput.serverIP) {
    headers['Gov-Vendor-Forwarded'] = formatVendorForwarded([
      { by: viaServerInput.serverIP, for: clientData.localIPs[0] || '' }
    ])
  }

  // Vendor License IDs
  if (vendorConfig.licenseIDs) {
    const licenseIDsFormatted = formatVendorLicenseIDs(vendorConfig.licenseIDs)
    if (licenseIDsFormatted) {
      headers['Gov-Vendor-License-IDs'] = licenseIDsFormatted
    }
  }

  // Vendor Product Name
  if (vendorConfig.productName) {
    headers['Gov-Vendor-Product-Name'] = encodeURIComponent(vendorConfig.productName)
  }

  // Vendor Public IP
  if (viaServerInput.serverIP) {
    headers['Gov-Vendor-Public-IP'] = viaServerInput.serverIP
  }

  // Vendor Version
  if (vendorConfig.version) {
    const versionFormatted = formatVendorVersion(vendorConfig.version)
    if (versionFormatted) {
      headers['Gov-Vendor-Version'] = versionFormatted
    }
  }
}

/**
 * Generate headers for DESKTOP_APP_DIRECT
 */
function generateDesktopAppDirectHeaders(input: EngineInput, headers: Record<string, string>): void {
  const { clientData, vendorConfig } = input

  // Local IPs
  if (clientData.localIPs && clientData.localIPs.length > 0) {
    headers['Gov-Client-Local-IPs'] = formatLocalIPs(clientData.localIPs)
  }

  // Local IPs Timestamp
  if (clientData.localIPsTimestamp) {
    headers['Gov-Client-Local-IPs-Timestamp'] = clientData.localIPsTimestamp
  }

  // MAC Addresses
  if (clientData.macAddresses && clientData.macAddresses.length > 0) {
    headers['Gov-Client-MAC-Addresses'] = formatMacAddresses(clientData.macAddresses)
  }

  // Multi-Factor
  if (vendorConfig.multiFactor && vendorConfig.multiFactor.length > 0) {
    const multiFactorFormatted = formatMultiFactor(vendorConfig.multiFactor)
    if (multiFactorFormatted) {
      headers['Gov-Client-Multi-Factor'] = multiFactorFormatted
    }
  }

  // Screens
  const screenData = extractScreenData(clientData)
  const screensFormatted = formatScreens(screenData)
  if (screensFormatted) {
    headers['Gov-Client-Screens'] = screensFormatted
  }

  // Timezone
  if (clientData.timezone) {
    headers['Gov-Client-Timezone'] = formatTimezone(clientData.timezone)
  }

  // User Agent (OS and device info)
  if (clientData.osFamily || clientData.osVersion || clientData.deviceManufacturer || clientData.deviceModel) {
    headers['Gov-Client-User-Agent'] = formatUserAgent(
      clientData.osFamily,
      clientData.osVersion,
      clientData.deviceManufacturer,
      clientData.deviceModel
    )
  }

  // User IDs
  if (clientData.userIDs) {
    headers['Gov-Client-User-IDs'] = formatUserIDs(clientData.userIDs)
  }

  // Window Size
  if (clientData.windowWidth && clientData.windowHeight) {
    headers['Gov-Client-Window-Size'] = formatWindowSize(clientData.windowWidth, clientData.windowHeight)
  }

  // Vendor License IDs
  if (vendorConfig.licenseIDs) {
    const licenseIDsFormatted = formatVendorLicenseIDs(vendorConfig.licenseIDs)
    if (licenseIDsFormatted) {
      headers['Gov-Vendor-License-IDs'] = licenseIDsFormatted
    }
  }

  // Vendor Product Name
  if (vendorConfig.productName) {
    headers['Gov-Vendor-Product-Name'] = encodeURIComponent(vendorConfig.productName)
  }

  // Vendor Version
  if (vendorConfig.version) {
    const versionFormatted = formatVendorVersion(vendorConfig.version)
    if (versionFormatted) {
      headers['Gov-Vendor-Version'] = versionFormatted
    }
  }
}

/**
 * Generate headers for DESKTOP_APP_VIA_SERVER
 */
function generateDesktopAppViaServerHeaders(input: EngineInput, headers: Record<string, string>): void {
  const { clientData, vendorConfig } = input
  const viaServerInput = input as Extract<EngineInput, { serverIP: string; serverPort: number }>

  // Include all DESKTOP_APP_DIRECT headers
  generateDesktopAppDirectHeaders(input, headers)

  // Add VIA_SERVER specific headers

  // Multi-Factor (if available)
  if (vendorConfig.multiFactor && vendorConfig.multiFactor.length > 0) {
    const multiFactorFormatted = formatMultiFactor(vendorConfig.multiFactor)
    if (multiFactorFormatted) {
      headers['Gov-Client-Multi-Factor'] = multiFactorFormatted
    }
  }

  // Public IP
  if (viaServerInput.serverIP) {
    headers['Gov-Client-Public-IP'] = viaServerInput.serverIP
  }

  // Public IP Timestamp
  headers['Gov-Client-Public-IP-Timestamp'] = new Date().toISOString()

  // Public Port
  if (viaServerInput.serverPort) {
    headers['Gov-Client-Public-Port'] = String(viaServerInput.serverPort)
  }

  // Vendor Forwarded
  if (viaServerInput.serverIP) {
    headers['Gov-Vendor-Forwarded'] = formatVendorForwarded([
      { by: viaServerInput.serverIP, for: clientData.localIPs[0] || '' }
    ])
  }

  // Vendor Public IP
  if (viaServerInput.serverIP) {
    headers['Gov-Vendor-Public-IP'] = viaServerInput.serverIP
  }
}

/**
 * Generate headers for MOBILE_APP_DIRECT
 */
function generateMobileAppDirectHeaders(input: EngineInput, headers: Record<string, string>): void {
  const { clientData, vendorConfig } = input

  // Local IPs
  if (clientData.localIPs && clientData.localIPs.length > 0) {
    headers['Gov-Client-Local-IPs'] = formatLocalIPs(clientData.localIPs)
  }

  // Local IPs Timestamp
  if (clientData.localIPsTimestamp) {
    headers['Gov-Client-Local-IPs-Timestamp'] = clientData.localIPsTimestamp
  }

  // Multi-Factor
  if (vendorConfig.multiFactor && vendorConfig.multiFactor.length > 0) {
    const multiFactorFormatted = formatMultiFactor(vendorConfig.multiFactor)
    if (multiFactorFormatted) {
      headers['Gov-Client-Multi-Factor'] = multiFactorFormatted
    }
  }

  // Screens
  const screenData = extractScreenData(clientData)
  const screensFormatted = formatScreens(screenData)
  if (screensFormatted) {
    headers['Gov-Client-Screens'] = screensFormatted
  }

  // Timezone
  if (clientData.timezone) {
    headers['Gov-Client-Timezone'] = formatTimezone(clientData.timezone)
  }

  // User Agent (OS and device info - key-value format for mobile)
  if (clientData.osFamily || clientData.osVersion || clientData.deviceManufacturer || clientData.deviceModel) {
    headers['Gov-Client-User-Agent'] = formatUserAgent(
      clientData.osFamily,
      clientData.osVersion,
      clientData.deviceManufacturer,
      clientData.deviceModel
    )
  }

  // User IDs
  if (clientData.userIDs) {
    headers['Gov-Client-User-IDs'] = formatUserIDs(clientData.userIDs)
  }

  // Window Size
  if (clientData.windowWidth && clientData.windowHeight) {
    headers['Gov-Client-Window-Size'] = formatWindowSize(clientData.windowWidth, clientData.windowHeight)
  }

  // Vendor License IDs
  if (vendorConfig.licenseIDs) {
    const licenseIDsFormatted = formatVendorLicenseIDs(vendorConfig.licenseIDs)
    if (licenseIDsFormatted) {
      headers['Gov-Vendor-License-IDs'] = licenseIDsFormatted
    }
  }

  // Vendor Product Name
  if (vendorConfig.productName) {
    headers['Gov-Vendor-Product-Name'] = encodeURIComponent(vendorConfig.productName)
  }

  // Vendor Version
  if (vendorConfig.version) {
    const versionFormatted = formatVendorVersion(vendorConfig.version)
    if (versionFormatted) {
      headers['Gov-Vendor-Version'] = versionFormatted
    }
  }
}

/**
 * Generate headers for MOBILE_APP_VIA_SERVER
 */
function generateMobileAppViaServerHeaders(input: EngineInput, headers: Record<string, string>): void {
  const { clientData, vendorConfig } = input
  const viaServerInput = input as Extract<EngineInput, { serverIP: string; serverPort: number }>

  // Include all MOBILE_APP_DIRECT headers
  generateMobileAppDirectHeaders(input, headers)

  // Add VIA_SERVER specific headers

  // Multi-Factor (if available)
  if (vendorConfig.multiFactor && vendorConfig.multiFactor.length > 0) {
    const multiFactorFormatted = formatMultiFactor(vendorConfig.multiFactor)
    if (multiFactorFormatted) {
      headers['Gov-Client-Multi-Factor'] = multiFactorFormatted
    }
  }

  // Public IP
  if (viaServerInput.serverIP) {
    headers['Gov-Client-Public-IP'] = viaServerInput.serverIP
  }

  // Public IP Timestamp
  headers['Gov-Client-Public-IP-Timestamp'] = new Date().toISOString()

  // Public Port
  if (viaServerInput.serverPort) {
    headers['Gov-Client-Public-Port'] = String(viaServerInput.serverPort)
  }

  // Vendor Forwarded
  if (viaServerInput.serverIP) {
    headers['Gov-Vendor-Forwarded'] = formatVendorForwarded([
      { by: viaServerInput.serverIP, for: clientData.localIPs[0] || '' }
    ])
  }

  // Vendor Public IP
  if (viaServerInput.serverIP) {
    headers['Gov-Vendor-Public-IP'] = viaServerInput.serverIP
  }
}

/**
 * Generate headers for BATCH_PROCESS_DIRECT
 */
function generateBatchProcessDirectHeaders(input: EngineInput, headers: Record<string, string>): void {
  const { clientData, vendorConfig } = input

  // Local IPs
  if (clientData.localIPs && clientData.localIPs.length > 0) {
    headers['Gov-Client-Local-IPs'] = formatLocalIPs(clientData.localIPs)
  }

  // Local IPs Timestamp
  if (clientData.localIPsTimestamp) {
    headers['Gov-Client-Local-IPs-Timestamp'] = clientData.localIPsTimestamp
  }

  // MAC Addresses
  if (clientData.macAddresses && clientData.macAddresses.length > 0) {
    headers['Gov-Client-MAC-Addresses'] = formatMacAddresses(clientData.macAddresses)
  }

  // Timezone (required for batch process)
  if (clientData.timezone) {
    headers['Gov-Client-Timezone'] = formatTimezone(clientData.timezone)
  }

  // User Agent
  if (clientData.osFamily || clientData.osVersion || clientData.deviceManufacturer || clientData.deviceModel) {
    headers['Gov-Client-User-Agent'] = formatUserAgent(
      clientData.osFamily,
      clientData.osVersion,
      clientData.deviceManufacturer,
      clientData.deviceModel
    )
  }

  // User IDs
  if (clientData.userIDs) {
    headers['Gov-Client-User-IDs'] = formatUserIDs(clientData.userIDs)
  }

  // Vendor License IDs
  if (vendorConfig.licenseIDs) {
    const licenseIDsFormatted = formatVendorLicenseIDs(vendorConfig.licenseIDs)
    if (licenseIDsFormatted) {
      headers['Gov-Vendor-License-IDs'] = licenseIDsFormatted
    }
  }

  // Vendor Product Name
  if (vendorConfig.productName) {
    headers['Gov-Vendor-Product-Name'] = encodeURIComponent(vendorConfig.productName)
  }

  // Vendor Version
  if (vendorConfig.version) {
    const versionFormatted = formatVendorVersion(vendorConfig.version)
    if (versionFormatted) {
      headers['Gov-Vendor-Version'] = versionFormatted
    }
  }
}


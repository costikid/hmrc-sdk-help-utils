import type { CollectedClientData } from './types.js'
import { getDeviceID } from './utils/deviceId.js'
import { collectScreenData } from './utils/screenData.js'
import { collectTimezone } from './utils/timezone.js'
import { collectBrowserJSUserAgent } from './utils/userAgent.js'
import { collectBrowserLocalIPs } from './utils/localIPs.js'
import { collectWindowSize } from './utils/windowSize.js'

/**
 * Collect browser client data for WEB_APP_VIA_SERVER and MOBILE_APP_VIA_SERVER connection methods
 *
 * This function collects data available in browser environments.
 * All failures return "" or [] per the silent rule.
 *
 * @returns Promise<CollectedClientData> - Complete client data object
 */
export async function collectBrowserData(): Promise<CollectedClientData> {
  const [
    deviceId,
    screenData,
    timezone,
    browserJSUserAgent,
    localIPs,
    windowSize
  ] = await Promise.all([
    getDeviceID(),
    collectScreenData(),
    collectTimezone(),
    collectBrowserJSUserAgent(),
    collectBrowserLocalIPs(),
    collectWindowSize()
  ])

  // Generate timestamp for local IPs
  const localIPsTimestamp = localIPs.length > 0
    ? new Date().toISOString()
    : ''

  return {
    // Screen data
    screenWidth: screenData.screenWidth,
    screenHeight: screenData.screenHeight,
    scalingFactor: screenData.scalingFactor,
    colourDepth: screenData.colourDepth,

    // Timezone
    timezone,

    // Browser-specific
    browserJSUserAgent,

    // Local network
    localIPs,
    localIPsTimestamp,
    macAddresses: [], // Not available in browser

    // Device identification
    deviceId,

    // OS and device info (not available in browser)
    osFamily: '',
    osVersion: '',
    deviceManufacturer: '',
    deviceModel: '',

    // Window data
    windowWidth: windowSize.windowWidth,
    windowHeight: windowSize.windowHeight,

    // User identifiers (application-specific)
    userIDs: '',

    // Multi-factor authentication data (empty by default)
    multiFactor: []
  }
}

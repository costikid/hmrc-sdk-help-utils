import type { CollectedClientData } from './types.js'
import { getDeviceID } from './utils/deviceId.js'
import { collectScreenData } from './utils/screenData.js'
import { collectTimezone } from './utils/timezone.js'
import { collectBrowserJSUserAgent } from './utils/userAgent.js'
import { collectBrowserLocalIPs } from './utils/localIPs.js'
import { collectWindowSize } from './utils/windowSize.js'

/**
 * Collect mobile client data for MOBILE_APP_DIRECT and MOBILE_APP_VIA_SERVER connection methods
 * 
 * This function collects data available in mobile environments.
 * Currently falls back to browser APIs as a baseline implementation.
 * In a production implementation, this would use React Native / Capacitor / Cordova native modules.
 * 
 * All failures return "" or [] per the silent rule.
 * 
 * @returns Promise<CollectedClientData> - Complete client data object
 */
export async function collectMobileData(): Promise<CollectedClientData> {
  try {
    // Try to detect if we're in a React Native / Capacitor environment
    const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
    const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined
    
    if (isReactNative || isCapacitor) {
      return await collectNativeMobileData(isReactNative, isCapacitor)
    }
    
    // Fall back to browser APIs
    return await collectBrowserMobileData()
  } catch (error) {
    console.warn('Unable to collect mobile data. Falling back to empty data.', error)
    return getEmptyMobileData()
  }
}

/**
 * Collect data using native mobile APIs (React Native / Capacitor)
 * This is a placeholder - in production, implement actual native module calls
 */
async function collectNativeMobileData(
  isReactNative: boolean,
  isCapacitor: boolean
): Promise<CollectedClientData> {
  // Placeholder for native mobile data collection
  // In production, this would call native modules for:
  // - Device info (manufacturer, model, OS version)
  // - MAC addresses (if available)
  // - Local IPs (if available)
  
  console.warn('Native mobile data collection not yet implemented. Falling back to browser APIs.')
  return await collectBrowserMobileData()
}

/**
 * Collect data using browser APIs (fallback for mobile web)
 */
async function collectBrowserMobileData(): Promise<CollectedClientData> {
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
    macAddresses: [], // Not available in mobile web

    // Device identification
    deviceId,

    // OS and device info (would come from native modules in production)
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

/**
 * Return empty mobile data as fallback
 */
function getEmptyMobileData(): CollectedClientData {
  return {
    screenWidth: '',
    screenHeight: '',
    scalingFactor: '',
    colourDepth: '',
    timezone: '',
    browserJSUserAgent: '',
    localIPs: [],
    localIPsTimestamp: '',
    macAddresses: [],
    deviceId: '',
    osFamily: '',
    osVersion: '',
    deviceManufacturer: '',
    deviceModel: '',
    windowWidth: '',
    windowHeight: '',
    userIDs: '',
    multiFactor: []
  }
}

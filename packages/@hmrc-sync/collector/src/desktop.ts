import type { CollectedClientData } from './types.js'
import { initialiseDeviceID } from './utils/deviceId.js'
import { collectScreenData } from './utils/screenData.js'
import { collectTimezone } from './utils/timezone.js'
import { collectNodeLocalIPs } from './utils/localIPs.js'
import { collectMacAddresses } from './utils/macAddresses.js'
import { collectWindowSize } from './utils/windowSize.js'

/**
 * Collect desktop client data for DESKTOP_APP_DIRECT and DESKTOP_APP_VIA_SERVER connection methods
 * 
 * This function collects data available in Node.js/desktop environments.
 * Uses dynamic imports for Node.js-only libraries to avoid polluting browser bundles.
 * All failures return "" or [] per the silent rule.
 * 
 * @returns Promise<CollectedClientData> - Complete client data object
 */
export async function collectDesktopData(): Promise<CollectedClientData> {
  const [
    deviceId,
    screenData,
    timezone,
    localIPs,
    macAddresses,
    windowSize,
    osInfo
  ] = await Promise.all([
    initialiseDeviceID(),
    collectScreenData(),
    collectTimezone(),
    collectNodeLocalIPs(),
    collectMacAddresses(),
    collectWindowSize(),
    collectOSInfo()
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

    // Browser-specific (not available in desktop)
    browserJSUserAgent: '',

    // Local network
    localIPs,
    localIPsTimestamp,
    macAddresses,

    // Device identification
    deviceId,

    // OS and device info
    osFamily: osInfo.osFamily,
    osVersion: osInfo.osVersion,
    deviceManufacturer: osInfo.deviceManufacturer,
    deviceModel: osInfo.deviceModel,

    // Window data (desktop apps may have window size)
    windowWidth: windowSize.windowWidth,
    windowHeight: windowSize.windowHeight,

    // User identifiers (application-specific)
    userIDs: '',

    // Multi-factor authentication data (empty by default)
    multiFactor: []
  }
}

/**
 * Collect OS and device information in Node.js environment
 */
async function collectOSInfo(): Promise<{
  osFamily: string
  osVersion: string
  deviceManufacturer: string
  deviceModel: string
}> {
  try {
    // Dynamic import to avoid Node.js-only import in browser
    const os = await import(/* @vite-ignore */ 'os')
    
    const platform = os.platform()
    const release = os.release()
    const arch = os.arch()
    
    // Map platform to OS family
    const osFamily = mapPlatformToOSFamily(platform)
    
    // Device manufacturer and model are difficult to get reliably in Node.js
    // In a real implementation, you might use platform-specific libraries
    const deviceManufacturer = ''
    const deviceModel = ''
    
    return {
      osFamily,
      osVersion: release,
      deviceManufacturer,
      deviceModel
    }
  } catch (error) {
    console.warn('Unable to collect OS information.', error)
    return {
      osFamily: '',
      osVersion: '',
      deviceManufacturer: '',
      deviceModel: ''
    }
  }
}

/**
 * Map Node.js platform to OS family
 */
function mapPlatformToOSFamily(platform: string): string {
  const platformMap: Record<string, string> = {
    'win32': 'Windows',
    'darwin': 'MacOS',
    'linux': 'Linux',
    'freebsd': 'FreeBSD',
    'openbsd': 'OpenBSD',
    'sunos': 'SunOS',
    'aix': 'AIX'
  }
  
  return platformMap[platform] || platform
}

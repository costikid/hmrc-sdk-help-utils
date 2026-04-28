import type { CollectedClientData } from '../types.js'

const DEVICE_ID_STORAGE_KEY = 'hmrc-fraud-prevention-device-id'

/**
 * Generate a UUID v4 using crypto.randomUUID()
 * Falls back to a simple UUID generator if not available
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Get or generate a device ID with persistence
 * 
 * In browser: stores in localStorage
 * In Node.js: stores in file system (implementation in desktop.ts)
 * Falls back to generating new UUID on each call if persistence fails
 */
export async function getDeviceID(): Promise<string> {
  // Browser environment
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
      
      if (!deviceId) {
        deviceId = generateUUID()
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
      }
      
      return deviceId
    } catch (error) {
      console.warn('Unable to access localStorage for device ID persistence. Generating new UUID on each request.', error)
      return generateUUID()
    }
  }
  
  // Node.js environment - will be handled by desktop.ts
  // Return empty string here, will be populated by desktop implementation
  return ''
}

/**
 * Initialise device ID for Node.js environments
 * This is called from desktop.ts to set up persistent storage
 */
export async function initialiseDeviceID(): Promise<string> {
  const deviceId = generateUUID()
  
  // In a real implementation, this would store to a file or registry
  // For now, we'll generate a new UUID each time in Node.js
  // TODO: Implement file system persistence for Node.js
  
  return deviceId
}

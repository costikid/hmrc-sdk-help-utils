/**
 * Multi-Factor Factor
 * 
 * Represents a single multi-factor authentication factor for Gov-Client-Multi-Factor header.
 */
export interface MultiFactorFactor {
  type: 'TOTP' | 'AUTH_CODE' | 'OTHER'
  timestamp: string // UTC timestamp format: yyyy-MM-ddThh:mmZ (can include seconds and milliseconds)
  uniqueReference: string // Hashed identifier for the factor
}

/**
 * CollectedClientData Interface
 * 
 * Flat object containing all possible client data fields across all connection methods.
 * All fields are strings or string arrays. Absent values are "" or [] per the silent rule.
 * Never null, never undefined, never omitted.
 */
export interface CollectedClientData {
  // Screen data
  screenWidth: string
  screenHeight: string
  scalingFactor: string
  colourDepth: string

  // Timezone
  timezone: string

  // Browser-specific
  browserJSUserAgent: string

  // Local network
  localIPs: string[]
  localIPsTimestamp: string
  macAddresses: string[]

  // Device identification
  deviceId: string

  // OS and device info (Node/desktop only)
  osFamily: string
  osVersion: string
  deviceManufacturer: string
  deviceModel: string

  // Window data
  windowWidth: string
  windowHeight: string

  // User identifiers (application-specific)
  userIDs: string

  // Multi-factor authentication data
  multiFactor: MultiFactorFactor[]
}

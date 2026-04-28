import { describe, it, expect } from 'vitest'
import { generateHeaders, ConnectionMethod } from '../src/index.js'
import type { CollectedClientData } from '@hmrc-sync/collector'

describe('Silent Rule Tests', () => {
  it('CollectedClientData with all empty strings still produces a header object with all required keys present', () => {
    const clientData: CollectedClientData = {
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

    const input = {
      method: ConnectionMethod.WEB_APP_VIA_SERVER as const,
      clientData,
      serverIP: '203.0.113.6',
      serverPort: 8443,
      vendorConfig: { productName: 'Test Product', version: { 'test': '1.0.0' } }
    }

    const headers = generateHeaders(input)

    // Connection method should always be present
    expect(headers['Gov-Client-Connection-Method']).toBe('WEB_APP_VIA_SERVER')

    // Server IP and port should be present from input
    expect(headers['Gov-Client-Public-IP']).toBe('203.0.113.6')
    expect(headers['Gov-Client-Public-Port']).toBe('8443')

    // Timestamp should be generated
    expect(headers['Gov-Client-Public-IP-Timestamp']).toBeDefined()
  })
})

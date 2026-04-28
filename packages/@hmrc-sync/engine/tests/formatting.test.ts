import { describe, it, expect } from 'vitest'
import { generateHeaders, ConnectionMethod } from '../src/index.js'
import type { CollectedClientData } from '@hmrc-sync/collector'

describe('Formatting Tests', () => {
  it('formats Gov-Client-Local-IPs as a comma-separated list with no spaces', () => {
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: '',
      localIPs: ['10.1.2.3', '10.3.4.2'],
      localIPsTimestamp: '2020-09-21T14:30:05.123Z',
      macAddresses: [],
      deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      osFamily: '',
      osVersion: '',
      deviceManufacturer: '',
      deviceModel: '',
      windowWidth: '1920',
      windowHeight: '1080',
      userIDs: '',
      multiFactor: []
    }

    const input = {
      method: ConnectionMethod.DESKTOP_APP_DIRECT as const,
      clientData,
      vendorConfig: { productName: 'Test Product', version: { 'test': '1.0.0' } }
    }

    const headers = generateHeaders(input)
    expect(headers['Gov-Client-Local-IPs']).toBe('10.1.2.3,10.3.4.2')
  })

  it('Gov-Client-Timezone matches /^UTC[+-]\\d{2}:\\d{2}$/', () => {
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: '',
      localIPs: [],
      localIPsTimestamp: '',
      macAddresses: [],
      deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      osFamily: '',
      osVersion: '',
      deviceManufacturer: '',
      deviceModel: '',
      windowWidth: '1920',
      windowHeight: '1080',
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
    expect(headers['Gov-Client-Timezone']).toMatch(/^UTC[+-]\d{2}:\d{2}$/)
  })

  it('formats Gov-Vendor-Version as key=value', () => {
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: '',
      localIPs: [],
      localIPsTimestamp: '',
      macAddresses: [],
      deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      osFamily: '',
      osVersion: '',
      deviceManufacturer: '',
      deviceModel: '',
      windowWidth: '1920',
      windowHeight: '1080',
      userIDs: '',
      multiFactor: []
    }

    const input = {
      method: ConnectionMethod.WEB_APP_VIA_SERVER as const,
      clientData,
      serverIP: '203.0.113.6',
      serverPort: 8443,
      vendorConfig: { productName: 'Test Product', version: { 'my-app': '1.0.0', 'another-app': '2.3.4' } }
    }

    const headers = generateHeaders(input)
    expect(headers['Gov-Vendor-Version']).toContain('my-app=1.0.0')
    expect(headers['Gov-Vendor-Version']).toContain('another-app=2.3.4')
  })
})

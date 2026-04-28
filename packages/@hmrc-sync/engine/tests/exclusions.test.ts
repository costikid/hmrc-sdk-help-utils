import { describe, it, expect } from 'vitest'
import { generateHeaders, ConnectionMethod } from '../src/index.js'
import type { CollectedClientData } from '@hmrc-sync/collector'

describe('Method Exclusion Tests', () => {
  it('BATCH_PROCESS_DIRECT output does not include Gov-Client-Screens', () => {
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: '',
      localIPs: ['10.1.2.3'],
      localIPsTimestamp: '2020-09-21T14:30:05.123Z',
      macAddresses: ['ea:43:1a:5d:21:45'],
      deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      osFamily: 'Windows',
      osVersion: '10',
      deviceManufacturer: 'Dell',
      deviceModel: 'OptiPlex',
      windowWidth: '',
      windowHeight: '',
      userIDs: 'os=domain%5Calice',
      multiFactor: []
    }

    const input = {
      method: ConnectionMethod.BATCH_PROCESS_DIRECT as const,
      clientData,
      vendorConfig: { productName: 'Test Product', version: { 'test': '1.0.0' } }
    }

    const headers = generateHeaders(input)
    expect(headers['Gov-Client-Screens']).toBeUndefined()
  })

  it('WEB_APP_VIA_SERVER output does not include Gov-Client-MAC-Addresses', () => {
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: 'Mozilla/5.0',
      localIPs: [],
      localIPsTimestamp: '',
      macAddresses: ['ea:43:1a:5d:21:45'],
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
    expect(headers['Gov-Client-MAC-Addresses']).toBeUndefined()
  })

  it('DESKTOP_APP_DIRECT output does not include Gov-Client-Browser-JS-User-Agent', () => {
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: '',
      localIPs: ['10.1.2.3'],
      localIPsTimestamp: '2020-09-21T14:30:05.123Z',
      macAddresses: ['ea:43:1a:5d:21:45'],
      deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      osFamily: 'Windows',
      osVersion: '10',
      deviceManufacturer: 'Dell',
      deviceModel: 'OptiPlex',
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
    expect(headers['Gov-Client-Browser-JS-User-Agent']).toBeUndefined()
  })
})

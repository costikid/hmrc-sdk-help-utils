import { describe, it, expect } from 'vitest'
import { generateHeaders, ConnectionMethod } from '../src/index.js'
import type { CollectedClientData } from '@hmrc-sync/collector'

describe('Compliance Tests', () => {
  it('generated headers for WEB_APP_VIA_SERVER match the example in HMRC documentation', () => {
    // Example from HMRC documentation for Gov-Vendor-Forwarded
    const clientData: CollectedClientData = {
      screenWidth: '1920',
      screenHeight: '1080',
      scalingFactor: '1',
      colourDepth: '24',
      timezone: 'UTC+00:00',
      browserJSUserAgent: 'Mozilla/5.0',
      localIPs: ['198.51.100.0'],
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
      method: ConnectionMethod.WEB_APP_VIA_SERVER as const,
      clientData,
      serverIP: '203.0.113.6',
      serverPort: 8443,
      vendorConfig: { productName: 'Test Product', version: { 'test': '1.0.0' } }
    }

    const headers = generateHeaders(input)

    // Check Gov-Vendor-Forwarded matches HMRC example format
    expect(headers['Gov-Vendor-Forwarded']).toBe('by=203.0.113.6&for=198.51.100.0')
  })

  it('generated headers for BATCH_PROCESS_DIRECT match the example in HMRC documentation', () => {
    // Example from HMRC documentation for Gov-Client-Local-IPs and Gov-Client-MAC-Addresses
    const clientData: CollectedClientData = {
      screenWidth: '',
      screenHeight: '',
      scalingFactor: '',
      colourDepth: '',
      timezone: 'UTC+00:00',
      browserJSUserAgent: '',
      localIPs: ['10.1.2.3', '10.3.4.2'],
      localIPsTimestamp: '2020-09-21T14:30:05.123Z',
      macAddresses: ['ea:43:1a:5d:21:45', '10:12:cc:fa:aa:32'],
      deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      osFamily: 'Windows',
      osVersion: 'Server 2012',
      deviceManufacturer: 'Dell Inc.',
      deviceModel: 'OptiPlex 980',
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

    // Check Gov-Client-Local-IPs matches HMRC example
    expect(headers['Gov-Client-Local-IPs']).toBe('10.1.2.3,10.3.4.2')

    // Check Gov-Client-MAC-Addresses matches HMRC example format (percent-encoded)
    expect(headers['Gov-Client-MAC-Addresses']).toBe('ea%3A43%3A1a%3A5d%3A21%3A45,10%3A12%3Acc%3Afa%3Aaa%3A32')
  })
})

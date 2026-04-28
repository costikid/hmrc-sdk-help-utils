import { describe, it, expect } from 'vitest'
import type { CollectedClientData } from '@hmrc-sync/collector'
import { ConnectionMethod } from '@hmrc-sync/engine'
import { prepareHmrcRequest } from '../src/prepare.js'

const baseClientData: CollectedClientData = {
  screenWidth: '1920',
  screenHeight: '1080',
  scalingFactor: '1',
  colourDepth: '24',
  timezone: 'UTC+00:00',
  browserJSUserAgent: 'Mozilla/5.0',
  localIPs: ['198.51.100.23'],
  localIPsTimestamp: '2020-09-21T14:30:05.123Z',
  macAddresses: ['ea:43:1a:5d:21:45'],
  deviceId: 'beec798b-b366-47fa-b1f8-92cede14a1ce',
  osFamily: 'Windows',
  osVersion: '11',
  deviceManufacturer: 'Dell',
  deviceModel: 'Latitude',
  windowWidth: '1366',
  windowHeight: '768',
  userIDs: '',
  multiFactor: []
}

const vendorConfig = {
  productName: 'MyTaxProduct',
  version: { MyTaxProduct: '1.0.0' }
}

describe('prepareHmrcRequest', () => {
  it('returns valid result for WEB_APP_VIA_SERVER with required fields', () => {
    const result = prepareHmrcRequest({
      method: ConnectionMethod.WEB_APP_VIA_SERVER,
      clientData: baseClientData,
      serverIP: '203.0.113.6',
      serverPort: 8443,
      vendorConfig,
      requestMeta: {
        executionContext: 'backend',
        submissionTarget: 'hmrc',
        integrationType: 'web'
      }
    })

    expect(result.guardrailIssues).toHaveLength(0)
    expect(result.validation.valid).toBe(true)
    expect(result.headers['Gov-Client-Connection-Method']).toBe('WEB_APP_VIA_SERVER')
  })

  it('fails fast when VIA_SERVER method misses server fields', () => {
    const result = prepareHmrcRequest({
      method: ConnectionMethod.WEB_APP_VIA_SERVER,
      clientData: baseClientData,
      vendorConfig,
      requestMeta: {
        executionContext: 'backend',
        submissionTarget: 'hmrc',
        integrationType: 'web'
      }
    })

    expect(result.validation.valid).toBe(false)
    expect(result.headers).toEqual({})
    expect(result.guardrailIssues.map((issue) => issue.code)).toContain('MISSING_SERVER_IP')
    expect(result.guardrailIssues.map((issue) => issue.code)).toContain('MISSING_SERVER_PORT')
  })

  it('blocks direct browser submission target to HMRC', () => {
    const result = prepareHmrcRequest({
      method: ConnectionMethod.DESKTOP_APP_DIRECT,
      clientData: baseClientData,
      vendorConfig,
      requestMeta: {
        executionContext: 'browser',
        submissionTarget: 'hmrc',
        integrationType: 'web'
      },
      explainMode: true
    })

    expect(result.guardrailIssues.map((issue) => issue.code)).toContain('BROWSER_DIRECT_HMRC_BLOCKED')
    expect(result.explanation).toContain('Blocked by')
  })
})

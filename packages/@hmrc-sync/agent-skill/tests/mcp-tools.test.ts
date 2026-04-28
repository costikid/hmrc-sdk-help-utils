import { describe, it, expect } from 'vitest'
import type { CollectedClientData } from '@hmrc-sync/collector'
import {
  buildSubmissionTool,
  executeHmrcTool,
  hmrcToolDefinitions,
  validateHeadersTool
} from '../src/mcp/server.js'

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

describe('mcp tools', () => {
  it('exposes expected tool names', () => {
    expect(hmrcToolDefinitions.map((tool) => tool.name)).toEqual([
      'hmrc.collect_client_data',
      'hmrc.generate_headers',
      'hmrc.validate_headers',
      'hmrc.build_submission'
    ])
  })

  it('buildSubmissionTool returns request template when valid', () => {
    const result = buildSubmissionTool({
      method: 'WEB_APP_VIA_SERVER',
      clientData: baseClientData,
      vendorConfig,
      serverIP: '203.0.113.6',
      serverPort: 8443,
      endpointUrl: 'https://api.service.hmrc.gov.uk/example',
      payload: { periodKey: '24A1' },
      requestMeta: {
        executionContext: 'backend',
        submissionTarget: 'hmrc',
        integrationType: 'web'
      }
    })

    expect(result.validation.valid).toBe(true)
    expect(result.requestTemplate?.url).toBe('https://api.service.hmrc.gov.uk/example')
  })

  it('validateHeadersTool returns structured issues', () => {
    const result = validateHeadersTool({
      headers: {
        'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
        'Gov-Client-Timezone': 'INVALID'
      },
      method: 'WEB_APP_VIA_SERVER'
    })

    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('executeHmrcTool rejects unknown tool names', async () => {
    await expect(executeHmrcTool('hmrc.unknown', {})).rejects.toThrow('Unknown tool')
  })
})

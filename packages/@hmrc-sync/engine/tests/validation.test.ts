import { describe, it, expect } from 'vitest'
import { validateHeaders, ConnectionMethod } from '../src/index.js'

describe('Validation Tests', () => {
  it('validateHeaders returns valid:false when Gov-Client-Timezone is malformed', () => {
    const headers = {
      'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
      'Gov-Client-Browser-JS-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Gov-Client-Device-ID': 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      'Gov-Client-Public-IP': '203.0.113.6',
      'Gov-Client-Public-IP-Timestamp': '2020-09-21T14:30:05.123Z',
      'Gov-Client-Public-Port': '8443',
      'Gov-Client-Screens': 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
      'Gov-Client-Timezone': 'INVALID_FORMAT',
      'Gov-Vendor-Forwarded': 'by=203.0.113.6&for=198.51.100.0',
      'Gov-Vendor-Product-Name': 'Product%20Name',
      'Gov-Vendor-Public-IP': '203.0.113.6',
      'Gov-Vendor-Version': 'my-application=1.0.0'
    }

    const result = validateHeaders(headers, ConnectionMethod.WEB_APP_VIA_SERVER)

    expect(result.valid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].header).toBe('Gov-Client-Timezone')
    expect(result.issues[0].reason).toContain('UTC±HH:MM')
  })

  it('validateHeaders returns valid:false when Gov-Client-Public-Port is a server port (80 or 443)', () => {
    const headers = {
      'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
      'Gov-Client-Browser-JS-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Gov-Client-Device-ID': 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      'Gov-Client-Public-IP': '203.0.113.6',
      'Gov-Client-Public-IP-Timestamp': '2020-09-21T14:30:05.123Z',
      'Gov-Client-Public-Port': '443',
      'Gov-Client-Screens': 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
      'Gov-Client-Timezone': 'UTC+00:00',
      'Gov-Vendor-Forwarded': 'by=203.0.113.6&for=198.51.100.0',
      'Gov-Vendor-Product-Name': 'Product%20Name',
      'Gov-Vendor-Public-IP': '203.0.113.6',
      'Gov-Vendor-Version': 'my-application=1.0.0'
    }

    const result = validateHeaders(headers, ConnectionMethod.WEB_APP_VIA_SERVER)

    expect(result.valid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].header).toBe('Gov-Client-Public-Port')
    expect(result.issues[0].reason).toContain('server port')
  })

  it('validateHeaders returns valid:true for a correctly formed WEB_APP_VIA_SERVER header set', () => {
    const headers = {
      'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
      'Gov-Client-Browser-JS-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Gov-Client-Device-ID': 'beec798b-b366-47fa-b1f8-92cede14a1ce',
      'Gov-Client-Public-IP': '203.0.113.6',
      'Gov-Client-Public-IP-Timestamp': '2020-09-21T14:30:05.123Z',
      'Gov-Client-Public-Port': '8443',
      'Gov-Client-Screens': 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
      'Gov-Client-Timezone': 'UTC+00:00',
      'Gov-Vendor-Forwarded': 'by=203.0.113.6&for=198.51.100.0',
      'Gov-Vendor-Product-Name': 'Product%20Name',
      'Gov-Vendor-Public-IP': '203.0.113.6',
      'Gov-Vendor-Version': 'my-application=1.0.0'
    }

    const result = validateHeaders(headers, ConnectionMethod.WEB_APP_VIA_SERVER)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})

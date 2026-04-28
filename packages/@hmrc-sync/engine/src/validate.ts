import type { HeaderValidationResult } from './types.js'
import { ConnectionMethod } from './types.js'

/**
 * Validation Regex Patterns
 * 
 * Regular expressions for validating header values against HMRC specification.
 */

const TIMEZONE_REGEX = /^UTC[+-]\d{2}:\d{2}$/
const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/
const IPV6_REGEX = /^[0-9a-f:]+$/i
const PORT_REGEX = /^(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}|0)$/
const SERVER_PORTS = [80, 443] // Ports that should be rejected per HMRC spec

/**
 * Required Headers per Connection Method
 */
const REQUIRED_HEADERS: Record<ConnectionMethod, string[]> = {
  [ConnectionMethod.DESKTOP_APP_DIRECT]: [
    'Gov-Client-Connection-Method',
    'Gov-Client-Device-ID',
    'Gov-Client-Local-IPs',
    'Gov-Client-Local-IPs-Timestamp',
    'Gov-Client-MAC-Addresses',
    'Gov-Client-Timezone',
    'Gov-Client-User-Agent',
    'Gov-Vendor-Product-Name',
    'Gov-Vendor-Version'
  ],
  [ConnectionMethod.DESKTOP_APP_VIA_SERVER]: [
    'Gov-Client-Connection-Method',
    'Gov-Client-Device-ID',
    'Gov-Client-Local-IPs',
    'Gov-Client-Local-IPs-Timestamp',
    'Gov-Client-MAC-Addresses',
    'Gov-Client-Public-IP',
    'Gov-Client-Public-IP-Timestamp',
    'Gov-Client-Public-Port',
    'Gov-Client-Timezone',
    'Gov-Client-User-Agent',
    'Gov-Vendor-Forwarded',
    'Gov-Vendor-Product-Name',
    'Gov-Vendor-Public-IP',
    'Gov-Vendor-Version'
  ],
  [ConnectionMethod.WEB_APP_VIA_SERVER]: [
    'Gov-Client-Connection-Method',
    'Gov-Client-Browser-JS-User-Agent',
    'Gov-Client-Device-ID',
    'Gov-Client-Public-IP',
    'Gov-Client-Public-IP-Timestamp',
    'Gov-Client-Public-Port',
    'Gov-Client-Screens',
    'Gov-Client-Timezone',
    'Gov-Vendor-Forwarded',
    'Gov-Vendor-Product-Name',
    'Gov-Vendor-Public-IP',
    'Gov-Vendor-Version'
  ],
  [ConnectionMethod.MOBILE_APP_DIRECT]: [
    'Gov-Client-Connection-Method',
    'Gov-Client-Device-ID',
    'Gov-Client-Local-IPs',
    'Gov-Client-Local-IPs-Timestamp',
    'Gov-Client-Screens',
    'Gov-Client-Timezone',
    'Gov-Client-User-Agent',
    'Gov-Vendor-Product-Name',
    'Gov-Vendor-Version'
  ],
  [ConnectionMethod.MOBILE_APP_VIA_SERVER]: [
    'Gov-Client-Connection-Method',
    'Gov-Client-Device-ID',
    'Gov-Client-Local-IPs',
    'Gov-Client-Local-IPs-Timestamp',
    'Gov-Client-Public-IP',
    'Gov-Client-Public-IP-Timestamp',
    'Gov-Client-Public-Port',
    'Gov-Client-Screens',
    'Gov-Client-Timezone',
    'Gov-Client-User-Agent',
    'Gov-Vendor-Forwarded',
    'Gov-Vendor-Product-Name',
    'Gov-Vendor-Public-IP',
    'Gov-Vendor-Version'
  ],
  [ConnectionMethod.BATCH_PROCESS_DIRECT]: [
    'Gov-Client-Connection-Method',
    'Gov-Client-Device-ID',
    'Gov-Client-Local-IPs',
    'Gov-Client-Local-IPs-Timestamp',
    'Gov-Client-MAC-Addresses',
    'Gov-Client-Timezone',
    'Gov-Client-User-Agent',
    'Gov-Vendor-Product-Name',
    'Gov-Vendor-Version'
  ]
}

/**
 * Validate HMRC Fraud Prevention Headers
 * 
 * Runs regex checks on each header value against HMRC format constraints.
 * Returns structured results - never throws.
 * 
 * @param headers - Record of header names to values
 * @param method - ConnectionMethod to validate against
 * @returns HeaderValidationResult with validation issues
 */
export function validateHeaders(
  headers: Record<string, string>,
  method: ConnectionMethod
): HeaderValidationResult {
  const issues: Array<{ header: string; value: string; reason: string }> = []
  const required = REQUIRED_HEADERS[method]

  // Check for missing required headers
  for (const header of required) {
    if (!headers[header] || headers[header] === '') {
      issues.push({
        header,
        value: headers[header] || '(missing)',
        reason: `This header is required for ${method} but is missing or empty`
      })
    }
  }

  // Validate each header's format
  for (const [header, value] of Object.entries(headers)) {
    if (!value) {
      continue // Already handled as missing
    }

    const validationError = validateHeaderFormat(header, value)
    if (validationError) {
      issues.push({
        header,
        value,
        reason: validationError
      })
    }
  }

  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Validate individual header format
 * 
 * @param header - Header name
 * @param value - Header value
 * @returns Error reason string or undefined if valid
 */
function validateHeaderFormat(header: string, value: string): string | undefined {
  switch (header) {
    case 'Gov-Client-Timezone':
      if (!TIMEZONE_REGEX.test(value)) {
        return 'Gov-Client-Timezone must follow the format UTC±HH:MM'
      }
      break

    case 'Gov-Client-Local-IPs-Timestamp':
    case 'Gov-Client-Public-IP-Timestamp':
      if (!TIMESTAMP_REGEX.test(value)) {
        return 'Timestamp must follow the format yyyy-MM-ddThh:mm:ss.sssZ'
      }
      break

    case 'Gov-Client-Device-ID':
      if (!UUID_REGEX.test(value)) {
        return 'Gov-Client-Device-ID must be a valid UUID format'
      }
      break

    case 'Gov-Client-Public-Port':
      const portNum = parseInt(value, 10)
      if (!PORT_REGEX.test(value) || portNum < 1 || portNum > 65535) {
        return 'Gov-Client-Public-Port must be a number between 1 and 65535'
      }
      if (SERVER_PORTS.includes(portNum)) {
        return 'Gov-Client-Public-Port must not be a server port (80 or 443)'
      }
      break

    case 'Gov-Client-Public-IP':
      // Check if it's a valid IPv4 or IPv6 address
      const isIPv4 = IPV4_REGEX.test(value)
      const isIPv6 = IPV6_REGEX.test(value)
      if (!isIPv4 && !isIPv6) {
        return 'Gov-Client-Public-IP must be a valid IPv4 or IPv6 address'
      }
      break

    case 'Gov-Client-Local-IPs':
      // Check each IP in the comma-separated list
      const ips = value.split(',')
      for (const ip of ips) {
        const decoded = decodeURIComponent(ip.trim())
        const ipIsIPv4 = IPV4_REGEX.test(decoded)
        const ipIsIPv6 = IPV6_REGEX.test(decoded)
        if (!ipIsIPv4 && !ipIsIPv6) {
          return 'Gov-Client-Local-IPs must contain valid IPv4 or IPv6 addresses separated by commas'
        }
      }
      break

    case 'Gov-Client-MAC-Addresses':
      // MAC addresses should be percent-encoded, but we check basic format
      const macs = value.split(',')
      for (const mac of macs) {
        if (!mac || mac.trim() === '') {
          return 'Gov-Client-MAC-Addresses must contain valid MAC addresses separated by commas'
        }
      }
      break

    case 'Gov-Client-Screens':
      // Screens should be in key=value format
      if (!value.includes('=') || !value.includes('width=')) {
        return 'Gov-Client-Screens must be in key=value format with at least width and height'
      }
      break

    case 'Gov-Client-Window-Size':
      // Window size should be in key=value format
      if (!value.includes('=') || !value.includes('width=')) {
        return 'Gov-Client-Window-Size must be in key=value format with width and height'
      }
      break

    case 'Gov-Client-User-Agent':
    case 'Gov-Client-User-IDs':
    case 'Gov-Client-Multi-Factor':
    case 'Gov-Vendor-Forwarded':
    case 'Gov-Vendor-License-IDs':
    case 'Gov-Vendor-Version':
      // These should be in key=value format
      if (!value.includes('=')) {
        return `This header must be in key=value format`
      }
      break

    case 'Gov-Client-Connection-Method':
      // Should be one of the valid connection methods
      const validMethods = [
        'DESKTOP_APP_DIRECT',
        'DESKTOP_APP_VIA_SERVER',
        'WEB_APP_VIA_SERVER',
        'MOBILE_APP_DIRECT',
        'MOBILE_APP_VIA_SERVER',
        'BATCH_PROCESS_DIRECT'
      ]
      if (!validMethods.includes(value)) {
        return 'Gov-Client-Connection-Method must be one of the valid HMRC connection methods'
      }
      break
  }

  return undefined
}

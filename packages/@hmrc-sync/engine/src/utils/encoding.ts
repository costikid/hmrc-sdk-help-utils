/**
 * Percent Encoding Utility
 * 
 * Wraps encodeURIComponent to match HMRC's exact encoding requirements.
 * Encodes individual values but not separators (commas, ampersands, equal signs).
 * 
 * Used for:
 * - Gov-Client-Browser-Plugins
 * - Gov-Client-Screens
 * - All key-value structures
 */

/**
 * Percent-encode a value according to RFC 3986
 * 
 * @param value - The string to encode
 * @returns The percent-encoded string
 */
export function percentEncode(value: string): string {
  if (!value) {
    return ''
  }
  
  return encodeURIComponent(value)
}

/**
 * Percent-encode each value in an array and join with commas
 * 
 * @param values - Array of strings to encode
 * @returns Comma-separated percent-encoded string
 */
export function encodeList(values: string[]): string {
  if (!values || values.length === 0) {
    return ''
  }
  
  return values.map(percentEncode).join(',')
}

/**
 * Encode a key-value pair as key=value
 * 
 * @param key - The key to encode
 * @param value - The value to encode
 * @returns Encoded key=value string
 */
export function encodeKeyValue(key: string, value: string): string {
  return `${percentEncode(key)}=${percentEncode(value)}`
}

/**
 * Encode multiple key-value pairs as key=value&key2=value2
 * 
 * @param pairs - Object with key-value pairs
 * @returns Encoded key=value&key2=value2 string
 */
export function encodeKeyValuePairs(pairs: Record<string, string>): string {
  return Object.entries(pairs)
    .map(([key, value]) => encodeKeyValue(key, value))
    .join('&')
}

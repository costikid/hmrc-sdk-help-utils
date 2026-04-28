/**
 * Collect timezone information
 * 
 * Returns timezone in UTC±HH:MM format
 * Falls back to UTC+00:00 if unavailable
 */
export async function collectTimezone(): Promise<string> {
  try {
    // Try Intl.DateTimeFormat for modern browsers
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      if (timezone) {
        // Convert IANA timezone to UTC offset format
        // This is a simplified conversion - in production, use a library like luxon or date-fns-tz
        const offset = getTimezoneOffset(timezone)
        return formatUTCOffset(offset)
      }
    }
    
    // Fallback to Date object
    const date = new Date()
    const offset = date.getTimezoneOffset()
    return formatUTCOffset(-offset) // getTimezoneOffset returns minutes, positive for behind UTC
  } catch (error) {
    console.warn('Unable to collect timezone. Using UTC+00:00.', error)
    return 'UTC+00:00'
  }
}

/**
 * Get timezone offset in minutes for a given IANA timezone
 * This is a simplified implementation - in production, use a proper timezone library
 */
function getTimezoneOffset(timezone: string): number {
  // For now, return 0 (UTC) - this should be implemented with a proper timezone library
  // TODO: Implement proper IANA to UTC offset conversion
  return 0
}

/**
 * Format offset in minutes to UTC±HH:MM format
 */
function formatUTCOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60
  
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

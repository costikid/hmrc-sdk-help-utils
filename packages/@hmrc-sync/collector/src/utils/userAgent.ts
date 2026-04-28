/**
 * Collect browser JavaScript user agent string
 * 
 * Returns navigator.userAgent in browser environments
 * Returns empty string in Node.js environments
 */
export async function collectBrowserJSUserAgent(): Promise<string> {
  // Browser environment
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return navigator.userAgent
  }
  
  // Node.js environment
  return ''
}

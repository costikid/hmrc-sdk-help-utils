/**
 * Collect MAC addresses
 * 
 * Node.js only - uses node-macaddress library
 * Must be dynamically imported to avoid polluting browser bundle
 * Returns empty array in browser environments or on failure
 */

/**
 * Collect MAC addresses in Node.js environment
 * Uses node-macaddress library as optional dependency
 */
export async function collectMacAddresses(): Promise<string[]> {
  // Browser environment - not available
  if (typeof window !== 'undefined') {
    return []
  }
  
  try {
    // Use new Function to hide the import from bundler static analysis.
    // node-macaddress is a Node-only optional dependency and must not be
    // resolved when this code is bundled for the browser.
    const macaddress = await (new Function('return import("node-' + 'macaddress")')() as Promise<any>)
    const addresses = await macaddress.default()
    
    if (addresses && typeof addresses === 'object') {
      // node-macaddress returns an object with interface names as keys
      return Object.values(addresses).filter((addr): addr is string => typeof addr === 'string')
    }
    
    return []
  } catch (error) {
    // node-macaddress may fail in Docker containers, cloud environments, or if not installed
    console.warn('Unable to collect MAC addresses. This may fail in Docker containers or cloud environments. Returning empty array.', error)
    return []
  }
}

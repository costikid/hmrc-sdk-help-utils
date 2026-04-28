/**
 * Collect local IP addresses
 * 
 * In browser: uses WebRTC (may be blocked by privacy settings)
 * In Node.js: uses os.networkInterfaces()
 */

/**
 * Collect local IPs in browser environment using WebRTC
 * This is often blocked by browsers for privacy reasons
 */
export async function collectBrowserLocalIPs(): Promise<string[]> {
  if (typeof window === 'undefined') {
    return []
  }
  
  try {
    const ips: string[] = []
    
    // Create a peer connection to get local IPs via WebRTC
    const rtc = new RTCPeerConnection({
      iceServers: []
    })
    
    rtc.createDataChannel('')
    
    const offer = await rtc.createOffer()
    await rtc.setLocalDescription(offer)
    
    return new Promise((resolve) => {
      rtc.onicecandidate = (event) => {
        if (!event.candidate) {
          rtc.close()
          resolve(ips)
          return
        }
        
        const candidate = event.candidate.candidate
        const match = candidate.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
        
        if (match && !ips.includes(match[1])) {
          ips.push(match[1])
        }
      }
      
      // Timeout after 2 seconds
      setTimeout(() => {
        rtc.close()
        resolve(ips)
      }, 2000)
    })
  } catch (error) {
    console.warn('Unable to collect local IPs via WebRTC. This may be blocked by browser privacy settings.', error)
    return []
  }
}

/**
 * Collect local IPs in Node.js environment using os.networkInterfaces()
 * Must be dynamically imported to avoid polluting browser bundle
 */
export async function collectNodeLocalIPs(): Promise<string[]> {
  try {
    // Dynamic import to avoid Node.js-only import in browser
    const os = await import(/* @vite-ignore */ 'os')
    const interfaces = os.networkInterfaces()
    const ips: string[] = []
    
    for (const name in interfaces) {
      for (const iface of interfaces[name] || []) {
        // Skip internal and non-IPv4 addresses
        if (!iface.internal && iface.family === 'IPv4') {
          ips.push(iface.address)
        }
        // Also include IPv6 addresses
        if (!iface.internal && iface.family === 'IPv6') {
          ips.push(iface.address)
        }
      }
    }
    
    return ips
  } catch (error) {
    console.warn('Unable to collect local IPs in Node.js environment.', error)
    return []
  }
}

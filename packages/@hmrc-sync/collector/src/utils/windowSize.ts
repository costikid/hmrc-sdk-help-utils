/**
 * Collect window size (width and height)
 * 
 * Returns window dimensions in browser environments
 * Returns default values in Node.js environments
 */
export async function collectWindowSize(): Promise<{
  windowWidth: string
  windowHeight: string
}> {
  // Browser environment
  if (typeof window !== 'undefined') {
    try {
      const windowWidth = String(window.innerWidth || '1920')
      const windowHeight = String(window.innerHeight || '1080')
      
      return {
        windowWidth,
        windowHeight
      }
    } catch (error) {
      console.warn('Unable to collect window size. Using default values.', error)
      return getDefaultWindowSize()
    }
  }
  
  // Node.js environment
  return getDefaultWindowSize()
}

function getDefaultWindowSize(): {
  windowWidth: string
  windowHeight: string
} {
  return {
    windowWidth: '1920',
    windowHeight: '1080'
  }
}

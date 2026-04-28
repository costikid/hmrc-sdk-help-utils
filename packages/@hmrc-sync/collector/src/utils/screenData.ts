/**
 * Collect screen data (width, height, scaling factor, colour depth)
 * 
 * Returns default values if screen data is unavailable
 */
export async function collectScreenData(): Promise<{
  screenWidth: string
  screenHeight: string
  scalingFactor: string
  colourDepth: string
}> {
  // Browser environment
  if (typeof window !== 'undefined' && window.screen) {
    try {
      const screen = window.screen
      const screenWidth = String(screen.width || '1920')
      const screenHeight = String(screen.height || '1080')
      const colourDepth = String(screen.colorDepth || '24')
      
      // Scaling factor - devicePixelRatio for high-DPI screens
      const scalingFactor = String(window.devicePixelRatio || 1)
      
      return {
        screenWidth,
        screenHeight,
        scalingFactor,
        colourDepth
      }
    } catch (error) {
      console.warn('Unable to collect screen data. Using default values.', error)
      return getDefaultScreenData()
    }
  }
  
  // Node.js environment - return defaults
  return getDefaultScreenData()
}

function getDefaultScreenData(): {
  screenWidth: string
  screenHeight: string
  scalingFactor: string
  colourDepth: string
} {
  return {
    screenWidth: '1920',
    screenHeight: '1080',
    scalingFactor: '1',
    colourDepth: '24'
  }
}

/**
 * Global type declarations for browser APIs
 */

declare global {
  interface Window {
    doNotTrack?: string
    Capacitor?: unknown
  }

  interface Navigator {
    msDoNotTrack?: string
    product?: string
  }
}

export {}

/**
 * @hmrc-sync/collector
 * 
 * Client-side data collection for HMRC Fraud Prevention Headers
 * 
 * This package collects client device and browser data required for HMRC fraud prevention headers.
 * It supports three environments: browser, desktop (Node.js), and mobile.
 * 
 * All functions return complete CollectedClientData objects with all fields present.
 * Absent values are always "" or [] per the silent rule.
 * 
 * @packageDocumentation
 */

export { collectBrowserData } from './browser.js'
export { collectDesktopData } from './desktop.js'
export { collectMobileData } from './mobile.js'

export type { CollectedClientData, MultiFactorFactor } from './types.js'

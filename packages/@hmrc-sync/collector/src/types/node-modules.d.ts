/**
 * Type declarations for Node.js built-in modules
 * 
 * These declarations are needed because the collector package is designed to work
 * in both browser and Node.js environments, but TypeScript needs to know about
 * Node.js modules even when they're dynamically imported.
 */

declare module 'os' {
  export interface NetworkInterfaceInfo {
    address: string
    netmask: string
    family: 'IPv4' | 'IPv6'
    mac: string
    internal: boolean
    cidr: string
  }

  export interface NetworkInterfaces {
    [interfaceName: string]: NetworkInterfaceInfo[]
  }

  export function networkInterfaces(): NetworkInterfaces
  export function platform(): string
  export function release(): string
  export function arch(): string
  export function cpus(): unknown[]
}

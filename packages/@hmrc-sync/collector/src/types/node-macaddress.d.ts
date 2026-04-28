/**
 * Type declarations for node-macaddress (optional dependency)
 * 
 * This file provides type definitions for the node-macaddress package.
 * Since it's an optional dependency, we declare the types here to avoid
 * requiring it to be installed for type checking.
 */

declare module 'node-macaddress' {
  interface NetworkInterfaces {
    [interfaceName: string]: string
  }

  function macaddresses(): Promise<NetworkInterfaces>
  function macaddresses(callback: (err: Error | null, addresses: NetworkInterfaces) => void): void

  export = macaddresses
}

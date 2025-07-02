'use client'

const STORAGE_KEY = 'relayer-config'

export interface Configuration {
  relayerUrl: string
  apiKey: string
  configJson: string
}

export const defaultConfig: Configuration = {
  relayerUrl: "http://localhost:8080",
  apiKey: "",
  configJson: "",
}

export function saveConfigToStorage(config: Configuration): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('Failed to save config to localStorage:', error)
    }
  }
}

export function loadConfigFromStorage(): Configuration {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure all required fields exist
        return {
          relayerUrl: parsed.relayerUrl || defaultConfig.relayerUrl,
          apiKey: parsed.apiKey || defaultConfig.apiKey,
          configJson: parsed.configJson || defaultConfig.configJson,
        }
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error)
    }
  }
  return defaultConfig
}

export function clearConfigFromStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear config from localStorage:', error)
    }
  }
}

export function hasStoredConfig(): boolean {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null
    } catch (error) {
      console.error('Failed to check stored config:', error)
      return false
    }
  }
  return false
}

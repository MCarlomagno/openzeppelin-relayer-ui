"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ConfigurationSectionProps {
  config: {
    relayerUrl: string
    apiKey: string
    configJson: string
  }
  setConfig: (config: any) => void
}

const defaultConfig = {
  relayers: [],
  notifications: [],
  signers: [],
  plugins: [],
}

export function ConfigurationSection({ config, setConfig }: ConfigurationSectionProps) {
  const [localConfig, setLocalConfig] = useState(config)
  const { toast } = useToast()

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleSave = () => {
    try {
      if (localConfig.configJson) {
        JSON.parse(localConfig.configJson)
      }
      setConfig(localConfig)
      toast({
        title: "Configuration saved",
        description: "Your relayer configuration has been updated.",
      })
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your configuration JSON format.",
        variant: "destructive",
      })
    }
  }

  const loadDefaultConfig = () => {
    setLocalConfig({
      ...localConfig,
      configJson: JSON.stringify(defaultConfig, null, 2),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relayer Configuration</CardTitle>
          <CardDescription>Configure your relayer connection settings and JSON configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relayer-url">Relayer URL</Label>
              <Input
                id="relayer-url"
                placeholder="http://localhost:8080"
                value={localConfig.relayerUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, relayerUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              id="config-json"
              placeholder="Paste your relayer configuration JSON here..."
              className="min-h-[400px] font-mono text-sm"
              value={localConfig.configJson}
              onChange={(e) => setLocalConfig({ ...localConfig, configJson: e.target.value })}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

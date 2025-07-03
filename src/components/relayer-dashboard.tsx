"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfigurationSection } from "./configuration-section"
import { RelayersSection } from "./relayers-section"
import { PluginsSection } from "./plugins-section"
import { DevSection } from "./dev-section"
import { loadConfigFromStorage, saveConfigToStorage, type Configuration, } from "@/lib/storage"

export function RelayerDashboard() {
  const [config, setConfig] = useState<Configuration>({
    relayerUrl: "http://localhost:8080",
    apiKey: "",
    configJson: "",
  });

  useEffect(() => {
    const storedConfig = loadConfigFromStorage()
    setConfig(storedConfig)
  }, [])

  const handleConfigChange = (newConfig: Configuration) => {
    setConfig(newConfig);
    saveConfigToStorage(newConfig);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Relayer Dashboard</h1>
        <p className="text-muted-foreground">Manage your OpenZeppelin relayers</p>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="relayers">Relayers</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="dev">Dev</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <ConfigurationSection config={config} setConfig={handleConfigChange} />
        </TabsContent>

        <TabsContent value="relayers">
          <RelayersSection config={config} />
        </TabsContent>

        <TabsContent value="plugins">
          <PluginsSection config={config} />
        </TabsContent>

        <TabsContent value="dev">
          <DevSection config={config} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

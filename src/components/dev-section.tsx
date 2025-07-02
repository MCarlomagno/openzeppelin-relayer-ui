"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PluginBenchSection } from "./plugin-bench-section"

interface DevSectionProps {
  config: {
    relayerUrl: string
    apiKey: string
    configJson: string
  }
}

export function DevSection({ config }: DevSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Tools</CardTitle>
          <CardDescription>Tools for testing and debugging your relayer system</CardDescription>
        </CardHeader>
        <CardContent>
          <PluginBenchSection config={config} />
        </CardContent>
      </Card>
    </div>
  )
}

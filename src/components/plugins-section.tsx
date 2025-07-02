"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@radix-ui/react-label"
import { Textarea } from "./ui/textarea"
import { callPlugin, CallPluginResponse } from "@/lib/relayer-actions"
import { toast } from "@/hooks/use-toast"

interface PluginsSectionProps {
  config: {
    relayerUrl: string
    apiKey: string
    configJson: string
  }
}

export function PluginsSection({ config }: PluginsSectionProps) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [showInvokePlugin, setShowInvokePlugin] = useState<string | null>(null)
  const [pluginResult, setPluginResult] = useState<CallPluginResponse | null>(null)

  useEffect(() => {
    if (config.configJson) {
      try {
        const parsedConfig = JSON.parse(config.configJson)
        setPlugins(parsedConfig.plugins || [])
      } catch (error) {
        console.error("Failed to parse config:", error)
      }
    }
  }, [config.configJson])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugins</CardTitle>
          <CardDescription>Available plugins for your relayer system</CardDescription>
        </CardHeader>
        <CardContent>
          {plugins.length === 0 ? (
            <p className="text-muted-foreground">No plugins configured. Please add configuration first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plugins.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell className="font-mono">{plugin.id}</TableCell>
                    <TableCell className="font-mono">{plugin.path}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="default" onClick={() => setShowInvokePlugin(plugin.id)}>
                        Invoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {showInvokePlugin && (
        <InvokePluginDialog
          plugin={plugins.find((p) => p.id === showInvokePlugin)}
          config={config}
          onClose={() => setShowInvokePlugin(null)}
          onSuccess={(result) => {
            console.log("result", result);
            setPluginResult(result)
          }}
        />  
      )}
      {pluginResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Plugin Execution Result

            {pluginResult.data.success && <Badge variant="default" className="bg-green-500 text-white">Success</Badge>}
            {pluginResult.data.error && <Badge variant="destructive">Error</Badge>}
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <Label>Logs</Label>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">{JSON.stringify(pluginResult.data.logs, null, 2)}</pre>
            <Label>Return Value</Label>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">{pluginResult.data.return_value}</pre>
            <Label>Traces</Label>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">{JSON.stringify(pluginResult.data.traces, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface InvokePluginDialogProps {
  plugin: any
  config: any
  onClose: () => void
  onSuccess: (result: CallPluginResponse) => void
}

function InvokePluginDialog({ plugin, config, onClose, onSuccess }: InvokePluginDialogProps) {
  const [params, setParams] = useState<string>("");

  const handleInvokePlugin = async () => {
    // checks that params is a valid JSON object if exists
    if (params) {
      try {
        JSON.parse(params);
      } catch (e) {
        console.error("Invalid JSON", e);
        toast({
          title: "Invalid JSON",
          description: "Please enter a valid JSON object.",
          variant: "destructive",
        })
        return;
      }
    }

    const paramsObj = params ? JSON.parse(params) : {};

    console.log("invoking plugin", plugin.id, paramsObj);
    let result = await callPlugin(config.relayerUrl, config.apiKey, plugin.id, paramsObj)
    console.log(result);

    toast({
      title: "Plugin invoked",
      description: result.data.message,
    })

    onSuccess(result);
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoke Plugin: {plugin?.id}</DialogTitle>
          <DialogDescription>
            Invoke the plugin passing custom parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Label>Parameters</Label>
          <Textarea
            value={params}
            onChange={(e) => setParams(e.target.value)}
            placeholder="Enter parameters as JSON"
            className="mt-2"
          />
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            onClick={handleInvokePlugin}
          >
            Invoke
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

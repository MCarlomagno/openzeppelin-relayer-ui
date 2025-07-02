"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { benchmarkPlugin } from "@/lib/relayer-actions"
import { Play, Square, BarChart3 } from "lucide-react"

interface PluginBenchSectionProps {
  config: {
    relayerUrl: string
    apiKey: string
    configJson: string
  }
}

interface BenchmarkResult {
  callIndex: number
  duration: number
  success: boolean
  response: any
  error?: string
  timestamp: string
}

interface BenchmarkStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  successRate: number
}

export function PluginBenchSection({ config }: PluginBenchSectionProps) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [selectedPlugin, setSelectedPlugin] = useState("")
  const [callCount, setCallCount] = useState("30")
  const [timeframe, setTimeframe] = useState("60") // seconds
  const [params, setParams] = useState(
    JSON.stringify(
      {
        foo: "bar",
        baz: 123,
      },
      null,
      2,
    ),
  )
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [stats, setStats] = useState<BenchmarkStats | null>(null)
  const [currentCall, setCurrentCall] = useState(0)
  const { toast } = useToast()

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

  const calculateStats = (results: BenchmarkResult[]): BenchmarkStats => {
    const successfulResults = results.filter((r) => r.success)
    const durations = successfulResults.map((r) => r.duration)

    return {
      totalCalls: results.length,
      successfulCalls: successfulResults.length,
      failedCalls: results.filter((r) => !r.success).length,
      averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
      successRate: results.length > 0 ? (successfulResults.length / results.length) * 100 : 0,
    }
  }

  const runBenchmark = async () => {
    if (!config.apiKey || !config.relayerUrl || !selectedPlugin) {
      toast({
        title: "Configuration required",
        description: "Please set your configuration and select a plugin.",
        variant: "destructive",
      })
      return
    }

    try {
      JSON.parse(params)
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your parameters JSON format.",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)
    setProgress(0)
    setResults([])
    setStats(null)
    setCurrentCall(0)

    const totalCalls = Number.parseInt(callCount)
    const timeframeMs = Number.parseInt(timeframe) * 1000
    const intervalMs = timeframeMs / totalCalls
    const parsedParams = JSON.parse(params)
    const newResults: BenchmarkResult[] = []

    console.log("totalCalls", totalCalls);
    console.log("timeframeMs", timeframeMs);
    console.log("intervalMs", intervalMs);
    console.log("parsedParams", parsedParams);

    toast({
      title: "Benchmark started",
      description: `Running ${totalCalls} calls over ${timeframe} seconds`,
    })

    for (let i = 0; i < totalCalls; i++) {
      // if (!isRunning) break // Allow stopping

      setCurrentCall(i + 1)
      setProgress(((i + 1) / totalCalls) * 100)

      const startTime = Date.now()
      try {
        console.log("calling plugin", selectedPlugin);
        const response = await benchmarkPlugin(config.relayerUrl, config.apiKey, selectedPlugin, parsedParams)
        const endTime = Date.now()
        const duration = endTime - startTime

        const result: BenchmarkResult = {
          callIndex: i + 1,
          duration,
          success: true,
          response,
          timestamp: new Date().toISOString(),
        }

        newResults.push(result)
        setResults([...newResults])
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        const result: BenchmarkResult = {
          callIndex: i + 1,
          duration,
          success: false,
          response: null,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }

        newResults.push(result)
        setResults([...newResults])
      }

      // Wait for the interval (except for the last call)
      if (i < totalCalls - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
      }
    }

    const finalStats = calculateStats(newResults)
    setStats(finalStats)
    setIsRunning(false)
    setProgress(100)

    toast({
      title: "Benchmark completed",
      description: `${finalStats.successfulCalls}/${finalStats.totalCalls} calls successful (${finalStats.successRate.toFixed(1)}%)`,
    })
  }

  const stopBenchmark = () => {
    setIsRunning(false)
    if (results.length > 0) {
      const finalStats = calculateStats(results)
      setStats(finalStats)
    }
    toast({
      title: "Benchmark stopped",
      description: "Benchmark was stopped by user",
    })
  }

  const clearResults = () => {
    setResults([])
    setStats(null)
    setProgress(0)
    setCurrentCall(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Benchmark</CardTitle>
          <CardDescription>
            Test plugin performance by making multiple calls within a specified timeframe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plugin</Label>
              <Select value={selectedPlugin} onValueChange={setSelectedPlugin} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plugin" />
                </SelectTrigger>
                <SelectContent>
                  {plugins.map((plugin) => (
                    <SelectItem key={plugin.id} value={plugin.id}>
                      {plugin.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Calls</Label>
              <Input
                value={callCount}
                onChange={(e) => setCallCount(e.target.value)}
                placeholder="30"
                type="number"
                min="1"
                max="1000"
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label>Timeframe (seconds)</Label>
              <Input
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="60"
                type="number"
                min="1"
                max="3600"
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label>Calls per Second</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {callCount && timeframe ? (Number.parseInt(callCount) / Number.parseInt(timeframe)).toFixed(2) : "0"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Parameters (JSON)</Label>
            <Textarea
              value={params}
              onChange={(e) => setParams(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
              placeholder="Enter plugin parameters as JSON..."
              disabled={isRunning}
            />
          </div>

          <div className="flex space-x-2">
            {!isRunning ? (
              <Button onClick={runBenchmark} className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Start Benchmark</span>
              </Button>
            ) : (
              <Button onClick={stopBenchmark} variant="destructive" className="flex items-center space-x-2">
                <Square className="h-4 w-4" />
                <span>Stop Benchmark</span>
              </Button>
            )}
            <Button onClick={clearResults} variant="outline" disabled={isRunning}>
              Clear Results
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Progress: {currentCall}/{callCount} calls
                </span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Benchmark Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{stats.totalCalls}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.averageDuration.toFixed(0)}ms</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Min/Max Duration</p>
                <p className="text-2xl font-bold">
                  {stats.minDuration.toFixed(0)}/{stats.maxDuration.toFixed(0)}ms
                </p>
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="default">{stats.successfulCalls} Successful</Badge>
                <Badge variant="destructive">{stats.failedCalls} Failed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Call Results</CardTitle>
            <CardDescription>Detailed results for each plugin call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Response/Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.callIndex}>
                      <TableCell>{result.callIndex}</TableCell>
                      <TableCell>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.duration}ms</TableCell>
                      <TableCell>{new Date(result.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px] overflow-hidden">
                          <pre className="text-xs bg-muted p-2 rounded truncate">
                            {result.success
                              ? JSON.stringify(result.response, null, 2)
                              : result.error || "Unknown error"}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

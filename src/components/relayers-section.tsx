"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Eye, ClipboardList, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRelayerBalance, getRelayerTransactions, listRelayers, ListTransactionResponse } from "@/lib/relayer-actions"
import { SendTransactionDialog } from "./send-transaction-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface RelayersSectionProps {
  config: {
    relayerUrl: string
    apiKey: string
    configJson: string
  }
}

export function RelayersSection({ config }: RelayersSectionProps) {
  const [relayers, setRelayers] = useState<{
    id: string;
    name: string;
    network: string;
    network_type: string;
    paused: boolean;
    address: string;
  }[]>([])
  const [selectedRelayer, setSelectedRelayer] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<ListTransactionResponse["data"]>([])
  const [balance, setBalance] = useState<{ relayerId: string, value: number, unit: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [showSendTransaction, setShowSendTransaction] = useState<string | null>(null)
  const [showTransactionInfo, setShowTransactionInfo] = useState<boolean>(false)
  const [selectedTransaction, setSelectedTransaction] = useState<ListTransactionResponse["data"][number] | null>(null)

  useEffect(() => {
    if (config.configJson) {
      try {
        listRelayers(config.relayerUrl, config.apiKey).then((result) => {
          console.log("result", result);
          setRelayers(result.data || [])
        });
      } catch (error) {
        console.error("Failed to parse config:", error)
      }
    }
  }, [config.configJson])

  const handleSendTransaction = async (relayerId: string) => {
    toast({
      title: "Not implemented",
      description: "This feature is not implemented yet.",
      variant: "destructive",
    })

    return;
    setShowSendTransaction(relayerId)
  }

  const handleRefreshBalance = async (relayerId: string) => {
    if (!config.apiKey || !config.relayerUrl) {
      toast({
        title: "Configuration required",
        description: "Please set your relayer URL and API key first.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await getRelayerBalance(config.relayerUrl, config.apiKey, relayerId)
      setBalance({ relayerId, value: result.data.balance, unit: result.data.unit })
      toast({
        title: "Balance refreshed",
        description: "Relayer balance has been updated.",
      })
    } catch (error) {
      toast({
        title: "Failed to fetch balance",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewTransactions = async (relayerId: string) => {
    if (!config.apiKey || !config.relayerUrl) {
      toast({
        title: "Configuration required",
        description: "Please set your relayer URL and API key first.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSelectedRelayer(relayerId)
    try {
      const result = await getRelayerTransactions(config.relayerUrl, config.apiKey, relayerId)
      console.log("result", result);
      setTransactions(result.data)
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      toast({
        title: "Failed to fetch transactions",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewTransaction = async (tx: ListTransactionResponse["data"][number]) => {
    setSelectedTransaction(tx);
    setShowTransactionInfo(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relayers</CardTitle>
          <CardDescription>Manage your configured relayers and view their transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relayers.length === 0 ? (
              <p className="text-muted-foreground">No relayers configured. Please add configuration first.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Paused</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relayers.map((relayer) => (
                    <TableRow key={relayer.id}>
                      <TableCell>{relayer.name}</TableCell>
                      <TableCell>{relayer.network}</TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer">{relayer.address.slice(0, 6)}...{relayer.address.slice(-4)}</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background p-2 rounded-md text-xs">
                            <p>{relayer.address}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{relayer.network_type}</TableCell>
                      <TableCell>
                        <Badge variant={relayer.paused ? "destructive" : "default"}>{relayer.paused ? "Yes" : "No"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefreshBalance(relayer.id)}
                                disabled={loading}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-background p-2 rounded-md text-xs">
                              <p>Get balance</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewTransactions(relayer.id)}
                                disabled={loading}
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-background p-2 rounded-md text-xs">
                              <p>View transactions</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button size="sm" variant="default" onClick={() => handleSendTransaction(relayer.id)}>
                            Send Tx
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRelayer && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions for {selectedRelayer}</CardTitle>
            <CardDescription>Recent transactions for this relayer</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground">No transactions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nonce</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono">
                        <Tooltip>
                          <TooltipTrigger asChild className="">
                            <span className="cursor-pointer">{tx.hash.slice(0, 6)}...{tx.hash.slice(-6)}</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background p-2 rounded-md text-xs">
                            <p>{tx.hash}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>{tx.status}</Badge>
                      </TableCell>
                      <TableCell>{tx.nonce}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleViewTransaction(tx)}>
                          View
                        </Button>
                      </TableCell>
                      <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {balance && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Information for {balance.relayerId}</CardTitle>
            <CardDescription>Current balance for selected relayer</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">{JSON.stringify(balance, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      {showSendTransaction && (
        <SendTransactionDialog
          relayer={relayers.find((r) => r.id === showSendTransaction)}
          config={config}
          onClose={() => setShowSendTransaction(null)}
        />
      )}

      <Dialog open={showTransactionInfo} onOpenChange={setShowTransactionInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Info</DialogTitle>
            <DialogDescription>
              Detailed information about the selected transaction.
            </DialogDescription>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">{JSON.stringify(selectedTransaction, null, 2)}</pre>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionInfo(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

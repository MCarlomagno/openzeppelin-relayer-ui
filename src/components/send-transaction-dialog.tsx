"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { sendEvmTransaction, sendSolanaTransaction, sendStellarTransaction } from "@/lib/relayer-actions"

interface SendTransactionDialogProps {
  relayer: any
  config: {
    relayerUrl: string
    apiKey: string
    configJson: string
  }
  onClose: () => void
}

export function SendTransactionDialog({ relayer, config, onClose }: SendTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // EVM form state
  const [evmForm, setEvmForm] = useState({
    to: "0xc834dcdc9a074dbbadcc71584789ae4b463db116",
    value: "0",
    data: "0x",
    gas_limit: "21000",
    speed: "FAST",
  })

  // Stellar form state
  const [stellarForm, setStellarForm] = useState({
    source_account: "",
    destination: "",
    amount: "1",
    network: relayer?.network || "testnet",
  })

  // Solana form state
  const [solanaForm, setSolanaForm] = useState({
    token: "So11111111111111111111111111111111111111112",
    amount: "1",
    source: "",
    destination: "",
  })

  const getExamplePayload = () => {
    switch (relayer?.network_type) {
      case "evm":
        return JSON.stringify(
          {
            to: evmForm.to,
            value: Number.parseInt(evmForm.value),
            data: evmForm.data,
            gas_limit: Number.parseInt(evmForm.gas_limit),
            speed: evmForm.speed,
          },
          null,
          2,
        )
      case "stellar":
        return JSON.stringify(
          {
            source_account: stellarForm.source_account,
            network: stellarForm.network,
            operations: [
              {
                type: "PAYMENT",
                destination: stellarForm.destination,
                amount: Number.parseInt(stellarForm.amount),
                asset: { type: "NATIVE" },
              },
            ],
          },
          null,
          2,
        )
      case "solana":
        return JSON.stringify(
          {
            method: "transferTransaction",
            id: 1,
            jsonrpc: "2.0",
            params: {
              token: solanaForm.token,
              amount: Number.parseInt(solanaForm.amount),
              source: solanaForm.source,
              destination: solanaForm.destination,
            },
          },
          null,
          2,
        )
      default:
        return "{}"
    }
  }

  const handleSendTransaction = async () => {
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
      let result
      switch (relayer.network_type) {
        case "evm":
          result = await sendEvmTransaction(config.relayerUrl, config.apiKey, relayer.id, {
            to: evmForm.to,
            value: Number.parseInt(evmForm.value),
            data: evmForm.data,
            gas_limit: Number.parseInt(evmForm.gas_limit),
            speed: evmForm.speed as any,
          })
          break
        case "stellar":
          result = await sendStellarTransaction(config.relayerUrl, config.apiKey, relayer.id, {
            source_account: stellarForm.source_account,
            network: stellarForm.network,
            operations: [
              {
                type: "PAYMENT" as any,
                destination: stellarForm.destination,
                amount: Number.parseInt(stellarForm.amount),
                asset: { type: "NATIVE" as any },
              },
            ],
          })
          break
        case "solana":
          result = await sendSolanaTransaction(config.relayerUrl, config.apiKey, relayer.id, {
            token: solanaForm.token,
            amount: Number.parseInt(solanaForm.amount),
            source: solanaForm.source,
            destination: solanaForm.destination,
          })
          break
      }

      toast({
        title: "Transaction sent",
        description: `Transaction ID: ${result?.id}`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Failed to send transaction",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => {
    switch (relayer?.network_type) {
      case "evm":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>To Address</Label>
              <Input
                value={evmForm.to}
                onChange={(e) => setEvmForm({ ...evmForm, to: e.target.value })}
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label>Value (Wei)</Label>
              <Input
                value={evmForm.value}
                onChange={(e) => setEvmForm({ ...evmForm, value: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                value={evmForm.data}
                onChange={(e) => setEvmForm({ ...evmForm, data: e.target.value })}
                placeholder="0x"
              />
            </div>
            <div className="space-y-2">
              <Label>Gas Limit</Label>
              <Input
                value={evmForm.gas_limit}
                onChange={(e) => setEvmForm({ ...evmForm, gas_limit: e.target.value })}
                placeholder="21000"
              />
            </div>
          </div>
        )
      case "stellar":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Account</Label>
              <Input
                value={stellarForm.source_account}
                onChange={(e) => setStellarForm({ ...stellarForm, source_account: e.target.value })}
                placeholder="GABC..."
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={stellarForm.destination}
                onChange={(e) => setStellarForm({ ...stellarForm, destination: e.target.value })}
                placeholder="GDEF..."
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                value={stellarForm.amount}
                onChange={(e) => setStellarForm({ ...stellarForm, amount: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Network</Label>
              <Select
                value={stellarForm.network}
                onValueChange={(value) => setStellarForm({ ...stellarForm, network: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case "solana":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Token Mint</Label>
              <Input
                value={solanaForm.token}
                onChange={(e) => setSolanaForm({ ...solanaForm, token: e.target.value })}
                placeholder="So11111111111111111111111111111111111111112"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                value={solanaForm.amount}
                onChange={(e) => setSolanaForm({ ...solanaForm, amount: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input
                value={solanaForm.source}
                onChange={(e) => setSolanaForm({ ...solanaForm, source: e.target.value })}
                placeholder="Source wallet address"
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={solanaForm.destination}
                onChange={(e) => setSolanaForm({ ...solanaForm, destination: e.target.value })}
                placeholder="Destination wallet address"
              />
            </div>
          </div>
        )
      default:
        return <div>Unsupported network type</div>
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Transaction - {relayer?.name}</DialogTitle>
          <DialogDescription>
            Send a {relayer?.network_type?.toUpperCase()} transaction on {relayer?.network}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderForm()}

          <div className="space-y-2">
            <Label>Generated Payload</Label>
            <Textarea value={getExamplePayload()} readOnly className="min-h-[200px] font-mono text-sm" />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendTransaction} disabled={loading}>
              {loading ? "Sending..." : "Send Transaction"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

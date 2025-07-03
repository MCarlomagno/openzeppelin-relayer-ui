import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Zap, Settings, Calculator, Clock } from 'lucide-react';
import { EvmTransactionRequest, Speed } from '@openzeppelin/relayer-sdk';
import { Relayer } from './relayers-section';
import { sendEvmTransaction } from '@/lib/relayer-actions';
import { toast } from '@/hooks/use-toast';

export default function TransactionDialog({ relayer, onClose, config }: { relayer: Relayer, onClose: () => void, config: { relayerUrl: string, apiKey: string } }) {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [speed, setSpeed] = useState<Speed | "custom">(Speed.AVERAGE);
  const [to, setTo] = useState("");
  const [value, setValue] = useState("0");
  const [data, setData] = useState("0x");
  const [gasLimit, setGasLimit] = useState("21000");
  const [gasPrice, setGasPrice] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [maxPriority, setMaxPriority] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const speedOptions = {
    [Speed.SAFE_LOW]: { name: "Safe Low", color: "bg-blue-500" },
    [Speed.AVERAGE]: { name: "Average", color: "bg-green-500" },
    [Speed.FAST]: { name: "Fast", color: "bg-orange-500" },
    [Speed.FASTEST]: { name: "Fastest", color: "bg-red-500" },
    custom: { name: "Custom", color: "bg-purple-500" }
  };

  const handleSendTransaction = async () => {
    const tx: EvmTransactionRequest = {
      to: to,
      value: Number(value),
      speed: speed !== "custom" ? speed : undefined,
      data: data,
      gas_limit: Number(gasLimit),
      gas_price: speed === "custom" ? Number(gasPrice) : undefined,
      max_fee_per_gas: speed === "custom" ? Number(maxFee) : undefined,
      max_priority_fee_per_gas: speed === "custom" ? Number(maxPriority) : undefined,
      valid_until: validUntil ? validUntil : undefined,
    }

    const response = await sendEvmTransaction(config.relayerUrl, config.apiKey, relayer.id, tx);
    if (response.success) {
      toast({
        title: "Transaction sent",
        description: "Transaction has been sent.",
      })
      onClose();
    } else {
      toast({
        title: "Failed to send transaction",
        description: response.error,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Send Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Relayer Info */}
          <Card>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {relayer.network_type}
                  </Badge>
                  <span className="font-medium">{relayer.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {relayer.network}
                  </span>
                </div>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {relayer.address.slice(0, 6)}...{relayer.address.slice(-4)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Basic Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="to">To Address</Label>
                <Input
                  id="to"
                  placeholder={"0x..."}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (ETH)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.001"
                  placeholder={"0"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Transaction Data</Label>
              <Textarea
                id="data"
                placeholder={"0x"}
                className="font-mono text-sm"
                rows={3}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          {/* Gas Speed Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Transaction Speed
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {Object.entries(speedOptions).map(([key, value]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all flex flex-col items-center justify-center p-1 hover:shadow-md ${speed === key ? 'ring-2 ring-primary' : ''
                    }`}
                  onClick={() => setSpeed(key as Speed | "custom")}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-3 h-3 rounded-full ${value.color} mx-auto mb-2`} />
                    <div className="font-medium text-sm">{value.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {speed !== 'custom' && (
              <p className="text-xs text-muted-foreground">
                Gas fees will be automatically calculated based on current network conditions
              </p>
            )}
          </div>


          {/* Advanced Settings - Only show when custom speed is selected */}
          {speed === 'custom' && (
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Custom Gas Settings
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {/* EIP-1559 Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFee">Max Fee Per Gas (gwei)</Label>
                    <Input
                      id="maxFee"
                      placeholder="30"
                      disabled={speed !== 'custom'}
                      value={maxFee}
                      onChange={(e) => setMaxFee(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPriority">Max Priority Fee (gwei)</Label>
                    <Input
                      id="maxPriority"
                      placeholder="2"
                      disabled={speed !== 'custom'}
                      value={maxPriority}
                      onChange={(e) => setMaxPriority(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gasPrice">Gas Price (gwei)</Label>
                    <Input
                      id="gasPrice"
                      placeholder="20"
                      disabled={speed !== 'custom'}
                      value={gasPrice}
                      onChange={(e) => setGasPrice(e.target.value)}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gasLimit" className="flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                Gas Limit
              </Label>
              <Input
                id="gasLimit"
                placeholder="21000"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Valid Until (optional)
              </Label>
              <Input
                id="validUntil"
                type="datetime-local"
                placeholder="Leave empty for no expiration"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>
          {/* Transaction Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm">
                <span>Selected Speed:</span>
                <span className="font-medium capitalize">{speedOptions[speed]?.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {speed === 'custom'
                  ? 'Using custom gas parameters'
                  : 'Gas fees will be calculated automatically'}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendTransaction}>
            Send Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
"use server"
type BalanceResponse = {
  data: {
    balance: number;
    unit: string;
  };
}

export type ListTransactionResponse = {
  data: {
    id: string;
    hash: string;
    status: string;
    nonce: number;
    from: string;
    to: string;
    value: string;
    gas_price: string;
    gas_limit: string;
    data: string;
    created_at: string;
    confirmed_at: string;
  }[];
}

type ListRelayersResponse = {
  data: {
    id: string;
    name: string;
    network: string;
    network_type: string;
    paused: boolean;
    address: string;
  }[];
};

export type CallPluginResponse = {
  data: {
    error: string;
    logs: { level: string; message: string }[];
    message: string;
    return_value: string;
    success: boolean;
    traces: { method: string; payload: any, relayer_id: string, request_id: string }[];
  };
};

export async function listRelayers(relayerUrl: string, apiKey: string): Promise<ListRelayersResponse> {
  const url = `${relayerUrl}/api/v1/relayers`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  return response.json();
}

export async function getRelayerBalance(relayerUrl: string, apiKey: string, relayerId: string): Promise<BalanceResponse> {
  const url = `${relayerUrl}/api/v1/relayers/${relayerId}/balance`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

export async function getRelayerTransactions(relayerUrl: string, apiKey: string, relayerId: string): Promise<ListTransactionResponse> {
  const url = `${relayerUrl}/api/v1/relayers/${relayerId}/transactions`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

export async function sendEvmTransaction(relayerUrl: string, apiKey: string, relayerId: string, transaction: any) {
  // Mock implementation
  // const config = new Configuration({
  //   basePath: relayerUrl,
  //   accessToken: apiKey,
  // });
  // const relayersApi = new RelayersApi(config);
  // return await relayersApi.sendTransaction(relayerId, transaction);

  return {
    id: "tx-" + Math.random().toString(36).substr(2, 9),
    status: "pending",
    created_at: new Date().toISOString(),
  }
}

export async function sendStellarTransaction(relayerUrl: string, apiKey: string, relayerId: string, transaction: any) {
  // Mock implementation
  throw new Error("Not implemented")
}

export async function sendSolanaTransaction(relayerUrl: string, apiKey: string, relayerId: string, params: any) {
  // Mock implementation
  // const config = new Configuration({
  //   basePath: relayerUrl,
  //   accessToken: apiKey,
  // });
  // const relayersApi = new RelayersApi(config);
  // return await relayersApi.rpc(relayerId, {
  //   method: 'transferTransaction',
  //   id: 1,
  //   jsonrpc: '2.0',
  //   params: params,
  // });
  throw new Error("Not implemented")
}

export async function callPlugin(relayerUrl: string, apiKey: string, pluginId: string, params: any): Promise<CallPluginResponse> {
  // Mock implementation
  // const config = new Configuration({
  //   basePath: relayerUrl,
  //   accessToken: apiKey,
  // });
  // const pluginsApi = new PluginsApi(config);
  // return await pluginsApi.callPlugin(pluginId, { params });
  const url = `${relayerUrl}/api/v1/plugins/${pluginId}/call`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ params })
  });

  return response.json();
}

export async function benchmarkPlugin(relayerUrl: string, apiKey: string, pluginId: string, params: any) {
  return callPlugin(relayerUrl, apiKey, pluginId, params)
}

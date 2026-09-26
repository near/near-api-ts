import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createClient } from '../../index';

// Answers every request with the given rpc result, the way a node would
export const startFakeRpc = async (rpcResult: unknown) => {
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ jsonrpc: '2.0', id: JSON.parse(body).id, result: rpcResult }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;

  const fakeClient = createClient({
    transport: { rpcEndpoints: { regular: [{ url: `http://localhost:${port}` }] } },
  });
  return { fakeClient, close: () => server.close() };
};

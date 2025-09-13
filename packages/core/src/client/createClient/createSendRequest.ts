import type { CreateSendRequest } from 'nat-types/client/client';

export const createSendRequest: CreateSendRequest =
  (clientContext) =>
  async ({ body }) => {
    const rpc = clientContext.regularRpcQueue.next();

    const response = await fetch(rpc.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...rpc.headers,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        ...body,
      }),
    });

    const { result, error } = await response.json();

    // TODO create error handling strategy
    if (error) throw new Error(error, { cause: error });
    // TODO check when it's possible?
    // if (result.error) throw rpcError(result.error);

    return result;
  };

import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type { CreateSendRequest } from 'nat-types/client/client';

// const rpcError = (error: any) => {
//   const e = new Error();
//   e.message = JSON.stringify(snakeToCamelCase(error), null, 2);
//   e.cause = error
//   return e;
// };

export const createSendRequest: CreateSendRequest =
  (clientContext) =>
  async ({ body, responseTransformer }) => {
    const { url, headers } = clientContext.regularRpcQueue.next();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        ...headers,
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

    if (responseTransformer) return responseTransformer(result);
    return snakeToCamelCase(result);
  };

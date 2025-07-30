import { snakeToCamelCase } from '../../utils/snakeToCamelCase';
import type { ClientState } from './createClient';

export type SendRequest = <Body, Result>(args: {
  body: Body;
}) => Promise<Result>;

const rpcError = (error: any) => {
  const e = new Error();
  e.message = JSON.stringify(error);
  return e;
};

export const createSendRequest =
  (clientState: ClientState): SendRequest =>
  async ({ body }) => {
    const { url, headers } = clientState.regularRpcQueue.next();

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
    if (error) throw rpcError(error);
    if (result.error) throw rpcError(result.error);

    return snakeToCamelCase(result);
  };

import type { ActionView } from '@near-js/jsonrpc-types';
import { fromJsonBytes, gas, yoctoNear } from '../../../../../../../../../index';
import type {
  ActionSummaries,
  ActionSummary,
} from '../../../../../../../../../types/_common/transactionDetails/actionSummaries';

export const getFunctionCallArgs = (base64: string) => {
  const bytes = Uint8Array.fromBase64(base64);
  try {
    // return { format: 'json', data: new TextDecoder().decode(bytes) };
    return fromJsonBytes(bytes);
  } catch {
    return { format: 'base64', base64 };
  }
};

const getActionSummary = (rpcAction: ActionView): ActionSummary => {
  if (typeof rpcAction === 'object' && 'FunctionCall' in rpcAction) {
    const { FunctionCall } = rpcAction;
    return {
      actionType: 'FunctionCall' as const,
      functionName: FunctionCall.methodName,
      functionArgs: getFunctionCallArgs(FunctionCall.args),
      gasLimit: gas(FunctionCall.gas),
      attachedDeposit: yoctoNear(FunctionCall.deposit),
    };
  }

  return rpcAction;
};

export const getActionSummaries = (rpcActions: ActionView[]): ActionSummaries => {
  return rpcActions.map(getActionSummary);
};

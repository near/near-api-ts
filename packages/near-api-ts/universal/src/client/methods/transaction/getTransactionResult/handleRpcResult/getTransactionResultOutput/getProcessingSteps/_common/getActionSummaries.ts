import type { ActionView } from '@near-js/jsonrpc-types';
import { fromJsonBytes, gas, yoctoNear } from '../../../../../../../../../index';
import type { Base64String } from '../../../../../../../../../types/_common/common';
import type { ActionSummary } from '../../../../../../../../../types/_common/transactionDetails/actionSummaries';

export const getFunctionArgs = (argsBase64: Base64String) => {
  try {
    return fromJsonBytes(Uint8Array.fromBase64(argsBase64));
  } catch {
    return argsBase64;
  }
};

export const baseGetActionSummary = (rpcAction: ActionView): ActionSummary => {
  if (rpcAction === 'CreateAccount') {
    return {
      actionType: 'CreateAccount',
    };
  }

  if ('FunctionCall' in rpcAction) {
    const { FunctionCall } = rpcAction;
    return {
      actionType: 'FunctionCall' as const,
      functionName: FunctionCall.methodName,
      functionArgs: getFunctionArgs(FunctionCall.args),
      gasLimit: gas(FunctionCall.gas),
      attachedDeposit: yoctoNear(FunctionCall.deposit),
    };
  }

  if ('Transfer' in rpcAction) {
    const { Transfer } = rpcAction;
    return {
      actionType: 'Transfer' as const,
      amount: yoctoNear(Transfer.deposit),
    };
  }

  if ('DeployContract' in rpcAction) {
    const { DeployContract } = rpcAction;
    return {
      actionType: 'DeployContract' as const,
      contractWasmHash: DeployContract.code,
    };
  }

  throw new Error('unreachable');
};

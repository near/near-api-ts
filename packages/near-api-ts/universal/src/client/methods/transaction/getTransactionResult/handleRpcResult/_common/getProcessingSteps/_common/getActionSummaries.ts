import type { ActionView } from '@near-js/jsonrpc-types';
import { fromJsonBytes, gas, yoctoNear } from '../../../../../../../../../index';
import type { Base64String } from '../../../../../../../../../types/_common/common';
import type { PublicKey } from '../../../../../../../../../types/_common/crypto';
import type {
  ParsedActionSummary,
  RawActionSummary,
} from '../../../../../../../../../types/_common/transactionDetails/actionSummaries';

export const getFunctionArgs = (argsBase64: Base64String) => {
  try {
    return fromJsonBytes(Uint8Array.fromBase64(argsBase64));
  } catch {
    return argsBase64;
  }
};

// Assembles the raw action summary from the RPC action - all fields are converted except
// functionCall.functionArgs which stays a raw base64 string;
export const getRawActionSummary = (rpcAction: ActionView): RawActionSummary => {
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
      functionArgs: FunctionCall.args,
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

  if ('Stake' in rpcAction) {
    const { Stake } = rpcAction;
    return {
      actionType: 'Stake' as const,
      amount: yoctoNear(Stake.stake),
      validatorPublicKey: Stake.publicKey as PublicKey, // TODO validate key by zod
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

// Default deserialization of the raw action summary - tries to parse functionCall.functionArgs
// as JSON, otherwise keeps the raw base64 string (functionArgs type stays unknown);
export const baseGetActionSummary = (rawActionSummary: RawActionSummary): ParsedActionSummary => {
  if (rawActionSummary.actionType === 'FunctionCall') {
    return {
      ...rawActionSummary,
      functionArgs: getFunctionArgs(rawActionSummary.functionArgs),
    };
  }

  return rawActionSummary;
};

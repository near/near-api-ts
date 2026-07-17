import type { ActionView } from '@near-js/jsonrpc-types';
import { gas, type PublicKey, yoctoNear } from '../../../../../../../index';
import type { RawActionSummary } from '../../../../../../../types/_common/transactionDetails/actionSummaries';

// Assembles the raw action summary from the RPC action - all fields are converted except
// functionCall.functionArgs which stays a raw base64 string;
export const getRawActionSummary = (rpcAction: ActionView): RawActionSummary => {
  if (rpcAction === 'CreateAccount') {
    return {
      actionType: 'CreateAccount',
    };
  }

  if ('Transfer' in rpcAction) {
    const { Transfer } = rpcAction;
    return {
      actionType: 'Transfer' as const,
      amount: yoctoNear(Transfer.deposit),
    };
  }

  if ('AddKey' in rpcAction) {
    const { AddKey } = rpcAction;

    if (AddKey.accessKey.permission === 'FullAccess')
      return {
        actionType: 'AddKey' as const,
        accessType: 'FullAccess' as const,
        publicKey: AddKey.publicKey as PublicKey,
      };

    if ('FunctionCall' in AddKey.accessKey.permission) {
      const { allowance, methodNames, receiverId } = AddKey.accessKey.permission.FunctionCall;
      const gasBudget = typeof allowance === 'string' ? yoctoNear(allowance) : 'Unlimited';
      const allowedFunctions = methodNames.length > 0 ? methodNames : 'AllNonPayable';

      return {
        actionType: 'AddKey' as const,
        accessType: 'FunctionCall' as const,
        publicKey: AddKey.publicKey as PublicKey,
        contractAccountId: receiverId,
        gasBudget,
        allowedFunctions,
      };
    }

    throw new Error('Unsupported access key permission', { cause: AddKey });
  }

  if ('DeployContract' in rpcAction) {
    const { DeployContract } = rpcAction;
    return {
      actionType: 'DeployContract' as const,
      contractWasmHash: DeployContract.code,
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

  if ('Stake' in rpcAction) {
    const { Stake } = rpcAction;
    return {
      actionType: 'Stake' as const,
      amount: yoctoNear(Stake.stake),
      validatorPublicKey: Stake.publicKey as PublicKey, // TODO validate key by zod
    };
  }

  if ('DeleteKey' in rpcAction) {
    const { DeleteKey } = rpcAction;
    return {
      actionType: 'DeleteKey' as const,
      publicKey: DeleteKey.publicKey as PublicKey, // TODO validate key by zod
    };
  }

  if ('DeleteAccount' in rpcAction) {
    const { DeleteAccount } = rpcAction;
    return {
      actionType: 'DeleteAccount' as const,
      beneficiaryAccountId: DeleteAccount.beneficiaryId,
    };
  }

  throw new Error('unreachable');
};

import type { DelegateAction, NonDelegateAction } from '@near-js/jsonrpc-types';
import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import type { Base64String } from '../../../../../../../../../types/_common/common';
import type { PublicKey, Signature } from '../../../../../../../../../types/_common/crypto';
import type { DelegableActionSummary } from '../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import { constants } from '../../../../../../../../_common/_common/_common/constants';
import { gas } from '../../../../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../../../../_common/nearToken';

// TODO try to reuse some action convertors from getRawActionSummary
const convertNonDelegateActionToSummary = (
  nonDelegateAction: NonDelegateAction,
): DelegableActionSummary<Base64String> => {
  // Not the same as in getRawActionSummary
  if ('CreateAccount' in nonDelegateAction)
    return {
      actionType: 'CreateAccount',
    };

  if ('Transfer' in nonDelegateAction)
    return {
      actionType: 'Transfer' as const,
      amount: yoctoNear(nonDelegateAction.Transfer.deposit),
    };

  if ('AddKey' in nonDelegateAction) {
    const { AddKey } = nonDelegateAction;

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

  // Not the same as in getRawActionSummary
  if ('DeployContract' in nonDelegateAction) {
    const { DeployContract } = nonDelegateAction;

    const contractWasmU8 = Uint8Array.fromBase64(DeployContract.code);
    const contractWasmHashU8 = sha256(contractWasmU8);
    const contractWasmHash = base58.encode(contractWasmHashU8);

    return {
      actionType: 'DeployContract' as const,
      contractWasmHash,
    };
  }

  if ('FunctionCall' in nonDelegateAction) {
    const { FunctionCall } = nonDelegateAction;
    return {
      actionType: 'FunctionCall' as const,
      functionName: FunctionCall.methodName,
      functionArgs: FunctionCall.args,
      gasLimit: gas(FunctionCall.gas),
      attachedDeposit: yoctoNear(FunctionCall.deposit),
    };
  }

  if ('Stake' in nonDelegateAction) {
    const { Stake } = nonDelegateAction;
    return {
      actionType: 'Stake' as const,
      amount: yoctoNear(Stake.stake),
      validatorPublicKey: Stake.publicKey as PublicKey, // TODO validate key by zod
    };
  }

  if ('DeleteKey' in nonDelegateAction) {
    const { DeleteKey } = nonDelegateAction;
    return {
      actionType: 'DeleteKey' as const,
      publicKey: DeleteKey.publicKey as PublicKey, // TODO validate key by zod
    };
  }

  if ('DeleteAccount' in nonDelegateAction) {
    const { DeleteAccount } = nonDelegateAction;
    return {
      actionType: 'DeleteAccount' as const,
      beneficiaryAccountId: DeleteAccount.beneficiaryId,
    };
  }

  throw new Error(`Unsupported delegable action: ${nonDelegateAction}`);
};

export const getRawExecuteDelegationActionSummary = (
  delegateAction: DelegateAction,
  signature: Signature,
) => {
  return {
    actionType: 'ExecuteDelegation' as const,
    delegation: {
      tag: constants.Nep366MetaTransaction.Tag,
      delegatorAccountId: delegateAction.senderId,
      delegatorPublicKey: delegateAction.publicKey as PublicKey,
      delegatedActionSummaries: delegateAction.actions.map(convertNonDelegateActionToSummary),
      receiverAccountId: delegateAction.receiverId,
      expiration: { blockHeight: delegateAction.maxBlockHeight },
      nonce: delegateAction.nonce,
    },
    signature: signature as Signature,
  };
};

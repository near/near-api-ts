import type { ActionView } from '@near-js/jsonrpc-types';
import { base58 } from '@scure/base';
import type { PublicKey, Signature } from '../../../../../../../../../types/_common/crypto';
import type { RawTransactionActionSummary } from '../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import { gas } from '../../../../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../../../../_common/nearToken';
import { getRawAddAccessKeyActionSummary } from './_common/getRawAddAccessKeyActionSummary';
import { getRawExecuteDelegationActionSummary } from './getRawExecuteDelegationActionSummary';

// Assembles the raw action summary from the RPC action - all fields are converted except
// functionCall.functionArgs which stays a raw base64 string;
export const getRawActionSummary = (rpcAction: ActionView): RawTransactionActionSummary => {
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

  if ('AddKey' in rpcAction) return getRawAddAccessKeyActionSummary(rpcAction.AddKey);

  if ('DeployContract' in rpcAction) {
    const { DeployContract } = rpcAction;
    const contractWasmHashU8 = Uint8Array.fromBase64(DeployContract.code);
    const contractWasmHash = base58.encode(contractWasmHashU8);

    return {
      actionType: 'DeployContract' as const,
      contractWasmHash,
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

  // Nearcore returns the two registration modes as separate views and hands back the hash of the
  // registered wasm rather than the wasm itself - the same way it does for `DeployContract`.
  if ('DeployGlobalContract' in rpcAction) {
    const { DeployGlobalContract } = rpcAction;
    const contractWasmHashU8 = Uint8Array.fromBase64(DeployGlobalContract.code);

    return {
      actionType: 'RegisterPinnableGlobalContract' as const,
      contractWasmHash: base58.encode(contractWasmHashU8),
    };
  }

  if ('DeployGlobalContractByAccountId' in rpcAction) {
    const { DeployGlobalContractByAccountId } = rpcAction;
    const contractWasmHashU8 = Uint8Array.fromBase64(DeployGlobalContractByAccountId.code);

    return {
      actionType: 'RegisterLinkableGlobalContract' as const,
      contractWasmHash: base58.encode(contractWasmHashU8),
    };
  }

  // Nearcore splits our `PinGlobalContract` and `LinkGlobalContract` the same way - one
  // `UseGlobalContract` action, two views, one per contract identifier.
  if ('UseGlobalContract' in rpcAction)
    return {
      actionType: 'PinGlobalContract' as const,
      globalContractWasmHash: rpcAction.UseGlobalContract.codeHash,
    };

  if ('UseGlobalContractByAccountId' in rpcAction)
    return {
      actionType: 'LinkGlobalContract' as const,
      globalContractAccountId: rpcAction.UseGlobalContractByAccountId.accountId,
    };

  if ('TransferToGasKey' in rpcAction)
    return {
      actionType: 'TopUpAccessKeyBalance' as const,
      publicKey: rpcAction.TransferToGasKey.publicKey as PublicKey, // TODO validate key by zod
      amount: yoctoNear(rpcAction.TransferToGasKey.deposit),
    };

  if ('WithdrawFromGasKey' in rpcAction)
    return {
      actionType: 'WithdrawAccessKeyBalance' as const,
      publicKey: rpcAction.WithdrawFromGasKey.publicKey as PublicKey, // TODO validate key by zod
      amount: yoctoNear(rpcAction.WithdrawFromGasKey.amount),
    };

  if ('Delegate' in rpcAction)
    return getRawExecuteDelegationActionSummary(
      rpcAction.Delegate.delegateAction,
      rpcAction.Delegate.signature as Signature,
    );

  throw new Error(`Unsupported action: ${JSON.stringify(rpcAction)}`);
};

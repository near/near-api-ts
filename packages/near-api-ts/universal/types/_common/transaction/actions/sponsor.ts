// import type { DelegateAction } from '@near-js/jsonrpc-types';
// import type { NatError } from '../../../../src/_common/natError';
// import type { Prettify } from '../../../utils';
// import type { AccountId, BlockHash, BlockHeight, Nonce, Result } from '../../common';
// import type { NativePublicKey, PublicKey, Signature } from '../../crypto';
// import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../natError';
// import type { Action, NativeAction } from '../transaction';
// import type {
//   AddFullAccessKeyAction,
//   AddFunctionCallKeyAction,
//   NativeAddKeyAction,
// } from './addKey';
// import type { CreateAccountAction, NativeCreateAccountAction } from './createAccount';
// import type { DeleteAccountAction, NativeDeleteAccountAction } from './deleteAccount';
// import type { DeleteKeyAction, NativeDeleteKeyAction } from './deleteKey';
// import type { DeployContractAction, NativeDeployContractAction } from './deployContract';
// import type { FunctionCallAction, NativeFunctionCallAction } from './functionCall';
// import type { NativeStakeAction, StakeAction } from './stake';
// import type { NativeTransferAction, TransferAction } from './transfer';

import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../natError';

export interface CreateSignedDelegateActionPublicErrorRegistry {
  'CreateAction.SignedDelegate.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.SignedDelegate.Internal': InternalErrorContext;
}
//
// export type CreateSignedDelegateActionArgs = {
//   delegateAction: DelegateAction;
//   signature: Signature;
// };
//
// export type SignedDelegateAction = {
//   actionType: 'SignedDelegate';
//   delegateAction: DelegateAction;
//   signature: Signature;
// };
//
// type CreateSignedDelegateActionError =
//   | NatError<'CreateAction.SignedDelegate.Args.InvalidSchema'>
//   | NatError<'CreateAction.SignedDelegate.Internal'>;
//
// export type SafeCreateSignedDelegateAction = (
//   args: CreateSignedDelegateActionArgs,
// ) => Result<SignedDelegateAction, CreateSignedDelegateActionError>;
//
// export type CreateSignedDelegateAction = (
//   args: CreateSignedDelegateActionArgs,
// ) => SignedDelegateAction;
//
// // ****** NATIVE ********
//
// export type NativeDelegatedAction =
//   | NativeCreateAccountAction
//   | NativeTransferAction
//   | NativeAddKeyAction
//   | NativeDeployContractAction
//   | NativeFunctionCallAction
//   | NativeStakeAction
//   | NativeDeleteKeyAction
//   | NativeDeleteAccountAction;
//
// export type NativeDelegateAction = {
//   senderId: AccountId;
//   publicKey: NativePublicKey;
//   actions: NativeDelegatedAction[];
//   receiverId: AccountId;
//   nonce: bigint;
//   blockHash: Uint8Array;
//   maxBlockHeight: bigint;
// };
//
// export type NativeSignedDelegateAction = {
//   signedDelegate: {
//     publicKey: NativePublicKey;
//   };
// };

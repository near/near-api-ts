// import type { DelegateAction } from '@near-js/jsonrpc-types';
// import type { NatError } from '../../../../src/_common/natError';
// import type { Prettify } from '../../../utils';
// import type { AccountId, BlockHash, BlockHeight, TransactionNonce, Result } from '../../common';
// import type { NearcorePublicKey, PublicKey, Signature } from '../../crypto';
// import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../natError';
// import type { Action, NearcoreAction } from '../transaction';
// import type {
//   AddFullAccessKeyAction,
//   AddFunctionCallKeyAction,
//   NearcoreAddKeyAction,
// } from './addKey';
// import type { CreateAccountAction, NearcoreCreateAccountAction } from './createAccount';
// import type { DeleteAccountAction, NearcoreDeleteAccountAction } from './deleteAccount';
// import type { DeleteKeyAction, NearcoreDeleteKeyAction } from './deleteKey';
// import type { DeployContractAction, NearcoreDeployContractAction } from './deployContract';
// import type { FunctionCallAction, NearcoreFunctionCallAction } from './functionCall';
// import type { NearcoreStakeAction, StakeAction } from './stake';
// import type { NearcoreTransferAction, TransferAction } from './transfer';

import type { DelegateAction } from '@near-js/jsonrpc-types';
import type { NearcorePublicKey, Signature } from '../../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { NearcoreSignedDelegation, SignedDelegation } from './delegation';

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
export type ExecuteDelegationAction = {
  actionType: 'ExecuteDelegation';
  delegation: SignedDelegation['delegation'];
  signature: SignedDelegation['signature'];
};
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
// // ****** NEARCORE ********
//
export type NearcoreExecuteDelegationAction = {
  executeDelegation: NearcoreSignedDelegation
};

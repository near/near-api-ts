import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../_common/natError';
import type { DelegationIntent } from '../../_common/transaction/actions/executeDelegation/delegation';
import type { SignDelegationOutput } from '../../_common/transaction/signDelegation';
import type { KeyPoolInnerErrorRegistry } from '../inner/keyPool';
import type { TaskQueueInnerErrorRegistry } from '../inner/taskQueue';
import type { SignerContext } from '../signer';

export interface SignDelegationPublicErrorRegistry {
  'Signer.SignDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Signer.SignDelegation.KeyPool.AccessKeys.NotLoaded': KeyPoolInnerErrorRegistry['Signer.KeyPool.AccessKeys.NotLoaded'];
  'Signer.SignDelegation.KeyPool.Empty': KeyPoolInnerErrorRegistry['Signer.KeyPool.Empty'];
  'Signer.SignDelegation.KeyPool.SignService.Failed': KeyPoolInnerErrorRegistry['Signer.KeyPool.SignService.Failed'];
  'Signer.SignDelegation.KeyPool.SigningKey.NotFound': KeyPoolInnerErrorRegistry['Signer.KeyPool.SigningKey.NotFound'];
  'Signer.SignDelegation.TaskQueue.Timeout': TaskQueueInnerErrorRegistry['Signer.TaskQueue.Timeout'];
  'Signer.SignDelegation.BlockHeight.NotLoaded': TaskQueueInnerErrorRegistry['Signer.BlockHeight.NotLoaded'];
  'Signer.SignDelegation.Internal': InternalErrorContext;
}

type SignDelegationIntentArgs = {
  intent: DelegationIntent;
};

type SignDelegationIntentError =
  | NatError<'Signer.SignDelegation.Args.InvalidSchema'>
  | NatError<'Signer.SignDelegation.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.SignDelegation.KeyPool.Empty'>
  | NatError<'Signer.SignDelegation.KeyPool.SignService.Failed'>
  | NatError<'Signer.SignDelegation.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.SignDelegation.TaskQueue.Timeout'>
  | NatError<'Signer.SignDelegation.BlockHeight.NotLoaded'>
  | NatError<'Signer.SignDelegation.Internal'>;

export type SafeSignDelegationIntent = (
  args: SignDelegationIntentArgs,
) => Promise<Result<SignDelegationOutput, SignDelegationIntentError>>;

export type SignDelegationIntent = (
  args: SignDelegationIntentArgs,
) => Promise<SignDelegationOutput>;

export type CreateSafeSignDelegation = (context: SignerContext) => SafeSignDelegationIntent;

import type { DelegationIntent, SignDelegationOutput, Signer } from '../../../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

// A signer takes a delegation intent - a delegation without its delegator - and gives the
// signed delegation, the same output a sign service gives
type _Args = Expect<Equal<Parameters<Signer['signDelegation']>[0], { intent: DelegationIntent }>>;
type _Output = Expect<Equal<Awaited<ReturnType<Signer['signDelegation']>>, SignDelegationOutput>>;

// It fails under its own prefix only, and with nothing about a recent block hash - a delegation
// has none
type Kind = Extract<
  Awaited<ReturnType<Signer['safeSignDelegation']>>,
  { success: false }
>['error']['kind'];

type _Kinds = Expect<
  Equal<
    Kind,
    | 'Signer.SignDelegation.Args.InvalidSchema'
    | 'Signer.SignDelegation.KeyPool.AccessKeys.NotLoaded'
    | 'Signer.SignDelegation.KeyPool.Empty'
    | 'Signer.SignDelegation.KeyPool.SignService.Failed'
    | 'Signer.SignDelegation.KeyPool.SigningKey.NotFound'
    | 'Signer.SignDelegation.TaskQueue.Timeout'
    | 'Signer.SignDelegation.Internal'
  >
>;

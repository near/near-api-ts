import type { DelegationIntent } from 'near-api-ts';
import { transfer, useSignDelegation } from '../../src';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

const { signDelegation } = useSignDelegation();

type Intent = Parameters<typeof signDelegation>[0]['intent'];

const delegatedAction = transfer({ amount: { near: '1' } });

// An intent may leave the expiration out - the signer picks it then, as a near-connect wallet does
signDelegation({ intent: { delegatedAction, receiverAccountId: 'bob.testnet' } });

// When it has one, it takes either form a near-api-ts intent takes
signDelegation({
  intent: { delegatedAction, receiverAccountId: 'bob.testnet', expiration: { inBlocks: 100 } },
});
type _Expiration = Assert<Equal<NonNullable<Intent['expiration']>, DelegationIntent['expiration']>>;

signDelegation({
  // @ts-expect-error a delegation delegates at least one action
  intent: { receiverAccountId: 'bob.testnet' },
});

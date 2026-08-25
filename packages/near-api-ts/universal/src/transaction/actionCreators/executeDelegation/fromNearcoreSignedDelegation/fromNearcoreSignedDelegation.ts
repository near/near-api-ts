import type { NearcoreSignature } from '../../../../../types/_common/crypto';
import type {
  NearcoreDelegation,
  SignedDelegation,
} from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { fromNearcoreDelegation } from './fromNearcoreDelegation/fromNearcoreDelegation';
import { fromNearcoreSignature } from './fromNearcoreSignature';

// The wire form of a nearcore `SignedDelegateAction` - unlike `NearcoreDelegation`, the
// delegation carries no `tag`: it is a signing-only prefix and never goes on the wire
// (see `SignedDelegationBorshSchema`).
export type WireSignedDelegation = {
  delegation: Omit<NearcoreDelegation, 'tag'>;
  signature: NearcoreSignature;
};

export const fromNearcoreSignedDelegation = (
  signedDelegation: WireSignedDelegation,
): SignedDelegation => ({
  delegation: fromNearcoreDelegation(signedDelegation.delegation),
  signature: fromNearcoreSignature(signedDelegation.signature),
});

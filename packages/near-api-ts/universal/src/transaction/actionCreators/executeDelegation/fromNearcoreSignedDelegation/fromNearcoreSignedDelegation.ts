import type { NearcoreSignature } from '../../../../../types/_common/crypto';
import type { SignedDelegation } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import {
  fromNearcoreDelegation,
  type WireDelegation,
} from './fromNearcoreDelegation/fromNearcoreDelegation';
import { fromNearcoreSignature } from './fromNearcoreSignature';

// The wire form of a nearcore `SignedDelegateAction` or `VersionedSignedDelegateAction` - unlike
// the signed one, the delegation carries no `tag`: it is a signing-only prefix and never goes on
// the wire (see `SignedDelegationV1BorshSchema` / `SignedDelegationV2BorshSchema`).
export type WireSignedDelegation = {
  delegation: WireDelegation;
  signature: NearcoreSignature;
};

export const fromNearcoreSignedDelegation = (
  signedDelegation: WireSignedDelegation,
): SignedDelegation => ({
  delegation: fromNearcoreDelegation(signedDelegation.delegation),
  signature: fromNearcoreSignature(signedDelegation.signature),
});

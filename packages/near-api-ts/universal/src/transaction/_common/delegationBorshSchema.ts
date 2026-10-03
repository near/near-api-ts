import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from './_common/_common/publicKeyBorshSchema';
import { AddKeyActionBorshSchema } from './_common/borshSchemas/addKey';
import { CreateAccountActionBorshSchema } from './_common/borshSchemas/createAccount';
import { DeleteAccountActionBorshSchema } from './_common/borshSchemas/deleteAccount';
import { DeleteKeyActionBorshSchema } from './_common/borshSchemas/deleteKey';
import { DeployContractActionBorshSchema } from './_common/borshSchemas/deployContract';
import { DeployGlobalContractActionBorshSchema } from './_common/borshSchemas/deployGlobalContract';
import { FunctionCallActionBorshSchema } from './_common/borshSchemas/functionCall';
import { SignatureBorshSchema } from './_common/borshSchemas/signature';
import { StakeActionBorshSchema } from './_common/borshSchemas/stake';
import { TransactionNonceBorshSchema } from './_common/borshSchemas/transactionNonce';
import { TransferActionBorshSchema } from './_common/borshSchemas/transfer';
import { TransferToGasKeyActionBorshSchema } from './_common/borshSchemas/transferToGasKey';
import { UseGlobalContractActionBorshSchema } from './_common/borshSchemas/useGlobalContract';
import { WithdrawFromGasKeyActionBorshSchema } from './_common/borshSchemas/withdrawFromGasKey';

// Delegation cannot contain another ExecuteDelegation action;
// But we have to keep it to make sure that the enum is the same as in nearcore
// (for borsh serialization/deserialization). So we use a placeholder struct here -
// `x: 'bool'`. The field type is not important, it is just used to make sure that
// the enum is the same.
const DelegableActionBorshSchema: Schema = {
  enum: [
    CreateAccountActionBorshSchema,
    DeployContractActionBorshSchema,
    FunctionCallActionBorshSchema,
    TransferActionBorshSchema,
    StakeActionBorshSchema,
    AddKeyActionBorshSchema,
    DeleteKeyActionBorshSchema,
    DeleteAccountActionBorshSchema,
    { struct: { x: 'bool' } },
    DeployGlobalContractActionBorshSchema,
    UseGlobalContractActionBorshSchema,
    // Slot 11 is nearcore's `DeterministicStateInit` - another unsupported action that has to
    // keep its place so `TransferToGasKey` and `WithdrawFromGasKey` land on indexes 12 and 13.
    { struct: { x: 'bool' } },
    TransferToGasKeyActionBorshSchema,
    WithdrawFromGasKeyActionBorshSchema,
  ],
};

// Field order is what ends up in the bytes, so it must follow the nearcore
// `DelegateAction` declaration exactly - `public_key` is the last field there,
// not the second one.
const BaseDelegationV1BorshSchema: Record<string, Schema> = {
  senderId: 'string',
  receiverId: 'string',
  actions: { array: { type: DelegableActionBorshSchema } },
  nonce: 'u64',
  maxBlockHeight: 'u64',
  publicKey: PublicKeyBorshSchema,
};

// Nearcore `DelegateActionV2` keeps the field order of `DelegateAction`, only its nonce can
// name a nonce channel. It always travels wrapped in `VersionedDelegateActionPayload`, whose
// `V2` discriminant (0) is the leading `version` byte - in the signed bytes and on the wire alike.
const BaseDelegationV2BorshSchema: Record<string, Schema> = {
  version: 'u8',
  senderId: 'string',
  receiverId: 'string',
  actions: { array: { type: DelegableActionBorshSchema } },
  nonce: TransactionNonceBorshSchema,
  maxBlockHeight: 'u64',
  publicKey: PublicKeyBorshSchema,
};

// `tag` is the delegation message tag - (1 << 30) + 366 = 1073742190 for NEP-366 and
// (1 << 30) + 611 = 1073742435 for NEP-611. It is not a field of the delegation, it is a prefix
// over the bytes that get hashed and signed, so it never goes on the wire. In nearcore the
// signature is made over `SignableMessage { discriminant: u32, msg: &DelegateAction }`, while the
// transaction carries a bare delegation inside its signed wrapper. Hence, the signing schemas
// have `tag` and the Signed* (wire) ones do not - a tag in the wire bytes would shift `senderId`
// and make the node fail to decode the transaction.

// NEP-366 - nearcore `DelegateAction`. This library no longer signs it, it only relays one
// signed elsewhere.
export const DelegationV1BorshSchema: Schema = {
  struct: {
    tag: 'u32',
    ...BaseDelegationV1BorshSchema,
  },
};

export const SignedDelegationV1BorshSchema: Schema = {
  struct: {
    delegation: { struct: BaseDelegationV1BorshSchema },
    signature: SignatureBorshSchema,
  },
};

// NEP-611 - nearcore `DelegateActionV2`.
export const DelegationV2BorshSchema: Schema = {
  struct: {
    tag: 'u32',
    ...BaseDelegationV2BorshSchema,
  },
};

export const SignedDelegationV2BorshSchema: Schema = {
  struct: {
    delegation: { struct: BaseDelegationV2BorshSchema },
    signature: SignatureBorshSchema,
  },
};

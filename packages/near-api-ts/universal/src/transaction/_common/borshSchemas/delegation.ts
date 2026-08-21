import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from '../_common/_common/borshSchemas/publicKey';
import { AddKeyActionBorshSchema } from '../_common/borshSchemas/addKey';
import { CreateAccountActionBorshSchema } from '../_common/borshSchemas/createAccount';
import { DeleteAccountActionBorshSchema } from '../_common/borshSchemas/deleteAccount';
import { DeleteKeyActionBorshSchema } from '../_common/borshSchemas/deleteKey';
import { DeployContractActionBorshSchema } from '../_common/borshSchemas/deployContract';
import { DeployGlobalContractActionBorshSchema } from '../_common/borshSchemas/deployGlobalContract';
import { FunctionCallActionBorshSchema } from '../_common/borshSchemas/functionCall';
import { SignatureBorshSchema } from '../_common/borshSchemas/signature';
import { StakeActionBorshSchema } from '../_common/borshSchemas/stake';
import { TransferActionBorshSchema } from '../_common/borshSchemas/transfer';
import { UseGlobalContractActionBorshSchema } from '../_common/borshSchemas/useGlobalContract';

// Delegation cannot contain another ExecuteDelegation action;
// But we have to keep it to make sure that the enum is the same as in nearcore
// (for borsh serialization/deserialization). So we use a placeholder struct here -
// `x: 'bool'`. The field type is not important, it is just used to make sure that
// the enum is the same.
const DelegatedActionBorshSchema: Schema = {
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
  ],
};

// Field order is what ends up in the bytes, so it must follow the nearcore
// `DelegateAction` declaration exactly - `public_key` is the last field there,
// not the second one.
const DelegationFieldsBorshSchema: Record<string, Schema> = {
  senderId: 'string',
  receiverId: 'string',
  actions: { array: { type: DelegatedActionBorshSchema } },
  nonce: 'u64',
  maxBlockHeight: 'u64',
  publicKey: PublicKeyBorshSchema,
};

// `tag` is the delegation message tag - (1 << 30) + 366 = 1073742190. It is not a
// field of the delegation, it is a prefix over the bytes that get hashed and signed,
// so it never goes on the wire. In nearcore the signature is made over
// `SignableMessage { discriminant: u32, msg: &DelegateAction }`, while the transaction
// carries a bare `DelegateAction` inside `SignedDelegateAction`. Hence, this schema
// (signing) has `tag` and SignedDelegationBorshSchema (wire) does not - a tag in the wire
// bytes would shift `senderId` and make the node fail to decode the transaction.
export const DelegationBorshSchema: Schema = {
  struct: {
    tag: 'u32',
    ...DelegationFieldsBorshSchema,
  },
};

export const SignedDelegationBorshSchema: Schema = {
  struct: {
    delegation: { struct: DelegationFieldsBorshSchema },
    signature: SignatureBorshSchema,
  },
};

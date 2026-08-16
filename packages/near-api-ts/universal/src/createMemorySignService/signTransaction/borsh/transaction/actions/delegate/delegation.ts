import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from '../../_common/publicKey';
import { SignatureBorshSchema } from '../../_common/signature';
import { AddKeyActionBorshSchema } from '../_common/addKey';
import { CreateAccountActionBorshSchema } from '../_common/createAccount';
import { DeleteAccountActionBorshSchema } from '../_common/deleteAccount';
import { DeleteKeyActionBorshSchema } from '../_common/deleteKey';
import { DeployContractActionBorshSchema } from '../_common/deployContract';
import { DeployGlobalContractActionBorshSchema } from '../_common/deployGlobalContract';
import { FunctionCallActionBorshSchema } from '../_common/functionCall';
import { StakeActionBorshSchema } from '../_common/stake';
import { TransferActionBorshSchema } from '../_common/transfer';
import { UseGlobalContractActionBorshSchema } from '../_common/useGlobalContract';

// Delegation cannot contain another delegate action;
// But we have to keep it to make sure that the enum is the same as in nearcore
// (for borsh serialization/deserialization). So we use a placeholder struct here -
// delegate: 'bool'. The field type is not important, it is just used to make sure that
// the enum is the same.
const NonDelegateActionBorshSchema: Schema = {
  enum: [
    CreateAccountActionBorshSchema,
    DeployContractActionBorshSchema,
    FunctionCallActionBorshSchema,
    TransferActionBorshSchema,
    StakeActionBorshSchema,
    AddKeyActionBorshSchema,
    DeleteKeyActionBorshSchema,
    DeleteAccountActionBorshSchema,
    { struct: { delegate: 'bool' } },
    DeployGlobalContractActionBorshSchema,
    UseGlobalContractActionBorshSchema,
  ],
};

// `tag` is the NEP-461 message discriminant - (1 << 30) + 366 = 1073742190. It is not a
// field of the delegation, it is a prefix over the bytes that get hashed and signed, so
// it never goes on the wire. In nearcore the signature is made over
// `SignableMessage { discriminant: u32, msg: &DelegateAction }`, while the transaction
// carries a bare `DelegateAction` inside `SignedDelegateAction`. Hence, this schema
// (signing) has `tag` and SignedDelegationBorshSchema (wire) does not - a tag in the wire
// bytes would shift `senderId` and make the node fail to decode the transaction.
export const DelegationBorshSchema: Schema = {
  struct: {
    tag: 'u32',
    senderId: 'string',
    publicKey: PublicKeyBorshSchema,
    receiverId: 'string',
    actions: { array: { type: NonDelegateActionBorshSchema } },
    nonce: 'u64',
    maxBlockHeight: 'u64',
  },
};

export const SignedDelegationBorshSchema: Schema = {
  struct: {
    delegation: {
      struct: {
        senderId: 'string',
        publicKey: PublicKeyBorshSchema,
        receiverId: 'string',
        actions: { array: { type: NonDelegateActionBorshSchema } },
        nonce: 'u64',
        maxBlockHeight: 'u64',
      },
    },
    signature: SignatureBorshSchema,
  },
};

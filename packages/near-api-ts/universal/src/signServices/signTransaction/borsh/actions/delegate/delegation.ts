import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from '../../publicKey';
import { SignatureBorshSchema } from '../../signature';
import { AddKeyActionBorshSchema } from '../addKey';
import { CreateAccountActionBorshSchema } from '../createAccount';
import { DeleteAccountActionBorshSchema } from '../deleteAccount';
import { DeleteKeyActionBorshSchema } from '../deleteKey';
import { DeployContractActionBorshSchema } from '../deployContract';
import { DeployGlobalContractActionBorshSchema } from '../deployGlobalContract';
import { FunctionCallActionBorshSchema } from '../functionCall';
import { StakeActionBorshSchema } from '../stake';
import { TransferActionBorshSchema } from '../transfer';
import { UseGlobalContractActionBorshSchema } from '../useGlobalContract';

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

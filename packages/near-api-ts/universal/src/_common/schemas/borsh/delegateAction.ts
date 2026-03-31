import type { Schema } from 'borsh';
import { addKeyActionBorshSchema } from './actions/addKey';
import { createAccountActionBorshSchema } from './actions/createAccount';
import { deleteAccountActionBorshSchema } from './actions/deleteAccount';
import { deleteKeyActionBorshSchema } from './actions/deleteKey';
import { deployContractActionBorshSchema } from './actions/deployContract';
import { deployGlobalContractActionBorshSchema } from './actions/deployGlobalContract';
import { functionCallActionBorshSchema } from './actions/functionCall';
import { stakeActionBorshSchema } from './actions/stake';
import { transferActionBorshSchema } from './actions/transfer';
import { useGlobalContractActionBorshSchema } from './actions/useGlobalContract';
import { PublicKeyBorshSchema } from './publicKey';
import { SignatureBorshSchema } from './signature';

// Delegate action cannot contain another delegate action;
// But we have to keep it to make sure that the enum is the same as in nearcore
// (for borsh serialization/deserialization). So we use a placeholder struct here -
// delegate: 'bool'. The field type is not important, it is just used to make sure that
// the enum is the same.
const NonDelegateActionBorshSchema: Schema = {
  enum: [
    createAccountActionBorshSchema,
    deployContractActionBorshSchema,
    functionCallActionBorshSchema,
    transferActionBorshSchema,
    stakeActionBorshSchema,
    addKeyActionBorshSchema,
    deleteKeyActionBorshSchema,
    deleteAccountActionBorshSchema,
    { struct: { delegate: 'bool' } },
    deployGlobalContractActionBorshSchema,
    useGlobalContractActionBorshSchema,
  ],
};

export const DelegateActionBorshSchema: Schema = {
  struct: {
    senderId: 'string',
    receiverId: 'string',
    actions: { array: { type: NonDelegateActionBorshSchema } },
    nonce: 'u64',
    maxBlockHeight: 'u64',
    publicKey: PublicKeyBorshSchema,
  },
};

export const SignedDelegateActionBorshSchema: Schema = {
  struct: {
    delegateAction: DelegateActionBorshSchema,
    signature: SignatureBorshSchema,
  },
};

import type { Schema } from 'borsh';
import { addKeyActionBorshSchema } from './actions/addKey';
import { createAccountActionBorshSchema } from './actions/createAccount';
import { deleteAccountActionBorshSchema } from './actions/deleteAccount';
import { deleteKeyActionBorshSchema } from './actions/deleteKey';
import { deployContractActionBorshSchema } from './actions/deployContract';
import { deployGlobalContractActionBorshSchema } from './actions/deployGlobalContract';
import { functionCallActionBorshSchema } from './actions/functionCall';
import { signedDelegateActionBorshSchema } from './actions/signedDelegate';
import { stakeActionBorshSchema } from './actions/stake';
import { transferActionBorshSchema } from './actions/transfer';
import { useGlobalContractActionBorshSchema } from './actions/useGlobalContract';
import { publicKeyBorshSchema } from './publicKey';
import { signatureBorshSchema } from './signature';

// Actions order in this enum is important and must match nearcore
const actionBorshSchema: Schema = {
  enum: [
    createAccountActionBorshSchema,
    deployContractActionBorshSchema,
    functionCallActionBorshSchema,
    transferActionBorshSchema,
    stakeActionBorshSchema,
    addKeyActionBorshSchema,
    deleteKeyActionBorshSchema,
    deleteAccountActionBorshSchema,
    signedDelegateActionBorshSchema,
    deployGlobalContractActionBorshSchema,
    useGlobalContractActionBorshSchema,
  ],
};

// Fields order is important and must follow the nearcore
export const transactionBorshSchema: Schema = {
  struct: {
    signerId: 'string',
    publicKey: publicKeyBorshSchema,
    nonce: 'u64',
    receiverId: 'string',
    blockHash: { array: { type: 'u8', len: 32 } },
    actions: { array: { type: actionBorshSchema } },
  },
};

export const signedTransactionBorshSchema: Schema = {
  struct: {
    transaction: transactionBorshSchema,
    signature: signatureBorshSchema,
  },
};

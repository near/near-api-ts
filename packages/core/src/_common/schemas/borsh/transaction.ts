import type { Schema } from 'borsh';
import { publicKeyBorshSchema } from './publicKey';
import { createAccountActionBorshSchema } from './actions/createAccount';
import { transferActionBorshSchema } from './actions/transfer';
import { addKeyActionBorshSchema } from './actions/addKey';
import { deployContractActionBorshSchema } from './actions/deployContract';
import { deployGlobalContractActionBorshSchema } from './actions/deployGlobalContract';
import { useGlobalContractActionBorshSchema } from './actions/useGlobalContract';
import { functionCallActionBorshSchema } from './actions/functionCall';
import { stakeActionBorshSchema } from './actions/stake';
import { deleteKeyActionBorshSchema } from './actions/deleteKey';
import { deleteAccountActionBorshSchema } from './actions/deleteAccount';
import { signedDelegateActionBorshSchema } from './actions/signedDelegate';

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

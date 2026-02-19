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
import { publicKeyBorshSchema } from './publicKey';

const allowedActionBorshSchema: Schema = {
  enum: [
    createAccountActionBorshSchema,
    deployContractActionBorshSchema,
    functionCallActionBorshSchema,
    transferActionBorshSchema,
    stakeActionBorshSchema,
    addKeyActionBorshSchema,
    deleteKeyActionBorshSchema,
    deleteAccountActionBorshSchema,
    { struct: { signedDelegate: 'string' } }, // TODO is it possible to rid this placeholder and keep enum order?
    deployGlobalContractActionBorshSchema,
    useGlobalContractActionBorshSchema,
  ],
};

export const delegateActionBorshSchema: Schema = {
  struct: {
    senderId: 'string',
    publicKey: publicKeyBorshSchema,
    actions: { array: { type: allowedActionBorshSchema } },
    receiverId: 'string',
    nonce: 'u64',
    maxBlockHeight: 'u64',
  },
};

// TODO add DelegateActionPrefix

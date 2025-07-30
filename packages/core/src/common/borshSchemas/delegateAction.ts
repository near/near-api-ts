import type { Schema } from 'borsh';
import { publicKeyBorshSchema } from './publicKey';
import { createAccountActionBorshSchema } from './actions/createAccount';
import { transferActionBorshSchema } from './actions/transfer';
import { addKeyActionBorshSchema } from './actions/addKey';
import { deployContractActionBorshSchema } from './actions/deployContract';
import { functionCallActionBorshSchema } from './actions/functionCall';
import { stakeActionBorshSchema } from './actions/stake';
import { deleteKeyActionBorshSchema } from './actions/deleteKey';
import { deleteAccountActionBorshSchema } from './actions/deleteAccount';
import { deployGlobalContractActionBorshSchema } from './actions/deployGlobalContract';
import { useGlobalContractActionBorshSchema } from './actions/useGlobalContract';

const allowedActionBorshSchema: Schema = {
  enum: [
    { struct: { createAccount: createAccountActionBorshSchema } },
    { struct: { deployContract: deployContractActionBorshSchema } },
    { struct: { functionCall: functionCallActionBorshSchema } },
    { struct: { transfer: transferActionBorshSchema } },
    { struct: { stake: stakeActionBorshSchema } },
    { struct: { addKey: addKeyActionBorshSchema } },
    { struct: { deleteKey: deleteKeyActionBorshSchema } },
    { struct: { deleteAccount: deleteAccountActionBorshSchema } },
    { struct: { signedDelegate: 'string' } }, // TODO is it possible to rid this placeholder?
    { struct: { deployGlobalContract: deployGlobalContractActionBorshSchema } },
    { struct: { useGlobalContract: useGlobalContractActionBorshSchema } },
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

import type { Schema } from 'borsh';
import { addKeyActionBorshSchema } from './addKey';
import { createAccountActionBorshSchema } from './createAccount';
import { DelegateActionBorshSchema } from './delegate';
import { deleteAccountActionBorshSchema } from './deleteAccount';
import { deleteKeyActionBorshSchema } from './deleteKey';
import { deployContractActionBorshSchema } from './deployContract';
import { deployGlobalContractActionBorshSchema } from './deployGlobalContract';
import { functionCallActionBorshSchema } from './functionCall';
import { stakeActionBorshSchema } from './stake';
import { transferActionBorshSchema } from './transfer';
import { useGlobalContractActionBorshSchema } from './useGlobalContract';

// Actions order in this enum is important (see how Borsh convert this to Rust enum)
// and must match nearcore
export const ActionBorshSchema: Schema = {
  enum: [
    createAccountActionBorshSchema,
    deployContractActionBorshSchema,
    functionCallActionBorshSchema,
    transferActionBorshSchema,
    stakeActionBorshSchema,
    addKeyActionBorshSchema,
    deleteKeyActionBorshSchema,
    deleteAccountActionBorshSchema,
    DelegateActionBorshSchema,
    deployGlobalContractActionBorshSchema,
    useGlobalContractActionBorshSchema,
  ],
};

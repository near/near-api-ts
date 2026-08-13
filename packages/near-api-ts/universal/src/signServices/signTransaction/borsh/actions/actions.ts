import type { Schema } from 'borsh';
import { AddKeyActionBorshSchema } from './addKey';
import { CreateAccountActionBorshSchema } from './createAccount';
import { DelegateActionBorshSchema } from './delegate/delegate';
import { DeleteAccountActionBorshSchema } from './deleteAccount';
import { DeleteKeyActionBorshSchema } from './deleteKey';
import { DeployContractActionBorshSchema } from './deployContract';
import { DeployGlobalContractActionBorshSchema } from './deployGlobalContract';
import { FunctionCallActionBorshSchema } from './functionCall';
import { StakeActionBorshSchema } from './stake';
import { TransferActionBorshSchema } from './transfer';
import { UseGlobalContractActionBorshSchema } from './useGlobalContract';

// Actions order in this enum is important (see how Borsh convert this to Rust enum)
// and must match nearcore
export const ActionBorshSchema: Schema = {
  enum: [
    CreateAccountActionBorshSchema,
    DeployContractActionBorshSchema,
    FunctionCallActionBorshSchema,
    TransferActionBorshSchema,
    StakeActionBorshSchema,
    AddKeyActionBorshSchema,
    DeleteKeyActionBorshSchema,
    DeleteAccountActionBorshSchema,
    DelegateActionBorshSchema,
    DeployGlobalContractActionBorshSchema,
    UseGlobalContractActionBorshSchema,
  ],
};

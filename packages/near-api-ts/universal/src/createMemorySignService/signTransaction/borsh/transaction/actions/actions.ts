import type { Schema } from 'borsh';
import { AddKeyActionBorshSchema } from './_common/addKey';
import { CreateAccountActionBorshSchema } from './_common/createAccount';
import { DeleteAccountActionBorshSchema } from './_common/deleteAccount';
import { DeleteKeyActionBorshSchema } from './_common/deleteKey';
import { DeployContractActionBorshSchema } from './_common/deployContract';
import { DeployGlobalContractActionBorshSchema } from './_common/deployGlobalContract';
import { FunctionCallActionBorshSchema } from './_common/functionCall';
import { StakeActionBorshSchema } from './_common/stake';
import { TransferActionBorshSchema } from './_common/transfer';
import { UseGlobalContractActionBorshSchema } from './_common/useGlobalContract';
import { DelegateActionBorshSchema } from './delegate/delegate';

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

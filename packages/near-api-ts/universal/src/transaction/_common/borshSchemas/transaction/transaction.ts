import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from './_common/_common/publicKey';
import { AddKeyActionBorshSchema } from './_common/delegableActions/addKey';
import { CreateAccountActionBorshSchema } from './_common/delegableActions/createAccount';
import { DeleteAccountActionBorshSchema } from './_common/delegableActions/deleteAccount';
import { DeleteKeyActionBorshSchema } from './_common/delegableActions/deleteKey';
import { DeployContractActionBorshSchema } from './_common/delegableActions/deployContract';
import { DeployGlobalContractActionBorshSchema } from './_common/delegableActions/deployGlobalContract';
import { FunctionCallActionBorshSchema } from './_common/delegableActions/functionCall';
import { StakeActionBorshSchema } from './_common/delegableActions/stake';
import { TransferActionBorshSchema } from './_common/delegableActions/transfer';
import { UseGlobalContractActionBorshSchema } from './_common/delegableActions/useGlobalContract';
import { SignatureBorshSchema } from './_common/signature';
import { ExecuteDelegationActionBorshSchema } from './executeDelegation/executeDelegation';

// Actions order in this enum is important (see how Borsh convert this to Rust enum)
// and must match nearcore
export const TransactionActionBorshSchema: Schema = {
  enum: [
    CreateAccountActionBorshSchema,
    DeployContractActionBorshSchema,
    FunctionCallActionBorshSchema,
    TransferActionBorshSchema,
    StakeActionBorshSchema,
    AddKeyActionBorshSchema,
    DeleteKeyActionBorshSchema,
    DeleteAccountActionBorshSchema,
    ExecuteDelegationActionBorshSchema,
    DeployGlobalContractActionBorshSchema,
    UseGlobalContractActionBorshSchema,
  ],
};

// Fields order is important and must follow the nearcore
export const TransactionBorshSchema: Schema = {
  struct: {
    signerId: 'string',
    publicKey: PublicKeyBorshSchema,
    nonce: 'u64',
    receiverId: 'string',
    blockHash: { array: { type: 'u8', len: 32 } },
    actions: { array: { type: TransactionActionBorshSchema } },
  },
};

export const SignedTransactionBorshSchema: Schema = {
  struct: {
    transaction: TransactionBorshSchema,
    signature: SignatureBorshSchema,
  },
};

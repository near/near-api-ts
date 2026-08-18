import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from '../../../_common/_common/_common/borshSchemas/publicKey';
import { AddKeyActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/addKey';
import { CreateAccountActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/createAccount';
import { DeleteAccountActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/deleteAccount';
import { DeleteKeyActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/deleteKey';
import { DeployContractActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/deployContract';
import { DeployGlobalContractActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/deployGlobalContract';
import { FunctionCallActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/functionCall';
import { StakeActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/stake';
import { TransferActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/transfer';
import { UseGlobalContractActionBorshSchema } from '../../../_common/_common/borshSchemas/delegableActions/useGlobalContract';
import { SignatureBorshSchema } from '../../../_common/_common/borshSchemas/signature';
import { ExecuteDelegationActionBorshSchema } from './executeDelegation';

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

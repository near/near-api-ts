import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from '../../../_common/_common/_common/borshSchemas/publicKey';
import { AddKeyActionBorshSchema } from '../../../_common/_common/borshSchemas/addKey';
import { CreateAccountActionBorshSchema } from '../../../_common/_common/borshSchemas/createAccount';
import { DeleteAccountActionBorshSchema } from '../../../_common/_common/borshSchemas/deleteAccount';
import { DeleteKeyActionBorshSchema } from '../../../_common/_common/borshSchemas/deleteKey';
import { DeployContractActionBorshSchema } from '../../../_common/_common/borshSchemas/deployContract';
import { DeployGlobalContractActionBorshSchema } from '../../../_common/_common/borshSchemas/deployGlobalContract';
import { FunctionCallActionBorshSchema } from '../../../_common/_common/borshSchemas/functionCall';
import { SignatureBorshSchema } from '../../../_common/_common/borshSchemas/signature';
import { StakeActionBorshSchema } from '../../../_common/_common/borshSchemas/stake';
import { TransferActionBorshSchema } from '../../../_common/_common/borshSchemas/transfer';
import { UseGlobalContractActionBorshSchema } from '../../../_common/_common/borshSchemas/useGlobalContract';
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

import type { Schema } from 'borsh';
import { PublicKeyBorshSchema } from '../_common/_common/_common/publicKeyBorshSchema';
import { AddKeyActionBorshSchema } from '../_common/_common/borshSchemas/addKey';
import { CreateAccountActionBorshSchema } from '../_common/_common/borshSchemas/createAccount';
import { DeleteAccountActionBorshSchema } from '../_common/_common/borshSchemas/deleteAccount';
import { DeleteKeyActionBorshSchema } from '../_common/_common/borshSchemas/deleteKey';
import { DeployContractActionBorshSchema } from '../_common/_common/borshSchemas/deployContract';
import { DeployGlobalContractActionBorshSchema } from '../_common/_common/borshSchemas/deployGlobalContract';
import { FunctionCallActionBorshSchema } from '../_common/_common/borshSchemas/functionCall';
import { SignatureBorshSchema } from '../_common/_common/borshSchemas/signature';
import { StakeActionBorshSchema } from '../_common/_common/borshSchemas/stake';
import { TransferActionBorshSchema } from '../_common/_common/borshSchemas/transfer';
import { TransferToGasKeyActionBorshSchema } from '../_common/_common/borshSchemas/transferToGasKey';
import { UseGlobalContractActionBorshSchema } from '../_common/_common/borshSchemas/useGlobalContract';
import { WithdrawFromGasKeyActionBorshSchema } from '../_common/_common/borshSchemas/withdrawFromGasKey';
import { SignedDelegationBorshSchema } from '../_common/delegationBorshSchema';

const ExecuteDelegationActionBorshSchema = {
  struct: {
    executeDelegation: SignedDelegationBorshSchema,
  },
};

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
    // Slot 11 is nearcore's `DeterministicStateInit`, which this library does not support yet.
    // The enum is positional, so the slot has to be filled for `TransferToGasKey` and
    // `WithdrawFromGasKey` to get the indexes nearcore expects (12 and 13). The placeholder is
    // never serialized, so its shape is arbitrary - same trick as the one in the delegation schema.
    { struct: { x: 'bool' } },
    TransferToGasKeyActionBorshSchema,
    WithdrawFromGasKeyActionBorshSchema,
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

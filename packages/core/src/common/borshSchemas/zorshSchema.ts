import { b } from "@zorsh/zorsh"

// Basic signature types
const Ed25519SignatureSchema = b.struct({
  data: b.array(b.u8(), 64),
})

const Secp256k1SignatureSchema = b.struct({
  data: b.array(b.u8(), 65),
})

const SignatureSchema = b.enum({
  ed25519Signature: Ed25519SignatureSchema,
  secp256k1Signature: Secp256k1SignatureSchema,
})

// Public key data types
const Ed25519DataSchema = b.struct({
  data: b.array(b.u8(), 32),
})

const Secp256k1DataSchema = b.struct({
  data: b.array(b.u8(), 64),
})

const PublicKeySchema = b.enum({
  ed25519Key: Ed25519DataSchema,
  secp256k1Key: Secp256k1DataSchema,
})

// Access key permissions
const FunctionCallPermissionSchema = b.struct({
  allowance: b.option(b.u128()),
  receiverId: b.string(),
  methodNames: b.vec(b.string()),
})

const FullAccessPermissionSchema = b.struct({})

const AccessKeyPermissionSchema = b.enum({
  functionCall: FunctionCallPermissionSchema,
  fullAccess: FullAccessPermissionSchema,
})

const AccessKeySchema = b.struct({
  nonce: b.u64(),
  permission: AccessKeyPermissionSchema,
})

// Action types
const CreateAccountSchema = b.struct({})

const DeployContractSchema = b.struct({
  code: b.vec(b.u8()),
})

const FunctionCallSchema = b.struct({
  methodName: b.string(),
  args: b.vec(b.u8()),
  gas: b.u64(),
  deposit: b.u128(),
})

const TransferSchema = b.struct({
  deposit: b.u128(),
})

const StakeSchema = b.struct({
  stake: b.u128(),
  publicKey: PublicKeySchema,
})

const AddKeySchema = b.struct({
  publicKey: PublicKeySchema,
  accessKey: AccessKeySchema,
})

const DeleteKeySchema = b.struct({
  publicKey: PublicKeySchema,
})

const DeleteAccountSchema = b.struct({
  beneficiaryId: b.string(),
})

const DelegateActionPrefixSchema = b.struct({
  prefix: b.u32(),
})

// Classic actions (used in delegate actions)
const ClassicActionsSchema = b.enum({
  createAccount: CreateAccountSchema,
  deployContract: DeployContractSchema,
  functionCall: FunctionCallSchema,
  transfer: TransferSchema,
  stake: StakeSchema,
  addKey: AddKeySchema,
  deleteKey: DeleteKeySchema,
  deleteAccount: DeleteAccountSchema,
})

// Delegate action types
const DelegateActionSchema = b.struct({
  senderId: b.string(),
  receiverId: b.string(),
  actions: b.vec(ClassicActionsSchema),
  nonce: b.u64(),
  maxBlockHeight: b.u64(),
  publicKey: PublicKeySchema,
})

const SignedDelegateSchema = b.struct({
  delegateAction: DelegateActionSchema,
  signature: SignatureSchema,
})

// All possible actions (classic + delegate)
const ActionSchema = b.enum({
  createAccount: CreateAccountSchema,
  deployContract: DeployContractSchema,
  functionCall: FunctionCallSchema,
  transfer: TransferSchema,
  stake: StakeSchema,
  addKey: AddKeySchema,
  deleteKey: DeleteKeySchema,
  deleteAccount: DeleteAccountSchema,
  signedDelegate: SignedDelegateSchema,
})

// Transaction types
export const TransactionSchema = b.struct({
  signerId: b.string(),
  publicKey: PublicKeySchema,
  nonce: b.u64(),
  receiverId: b.string(),
  blockHash: b.array(b.u8(), 32),
  actions: b.vec(ActionSchema),
})

export const SignedTransactionSchema = b.struct({
  transaction: TransactionSchema,
  signature: SignatureSchema,
})

// Type inference examples
export type Ed25519Signature = b.infer<typeof Ed25519SignatureSchema>
export type Secp256k1Signature = b.infer<typeof Secp256k1SignatureSchema>
export type Signature = b.infer<typeof SignatureSchema>
export type PublicKey = b.infer<typeof PublicKeySchema>
export type AccessKey = b.infer<typeof AccessKeySchema>
export type Action = b.infer<typeof ActionSchema>
export type Transaction = b.infer<typeof TransactionSchema>
export type SignedTransaction = b.infer<typeof SignedTransactionSchema>

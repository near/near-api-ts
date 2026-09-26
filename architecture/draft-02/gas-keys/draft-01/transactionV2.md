### Option 1

```typescript
// Transaction

type NonceProgression =
  | 'Increasing'  // value > current
  | 'Consecutive'; // value == current + 1

type TransactionNonce = {
  scheme: 'RegularNonce', // SignleNonce?
  newValue: number,
  progression: 'Consecutive' | 'Increasing'; // or sequence
} | {
  scheme: 'NonceLane'; // NonceLanes?
  newValue: number;
  laneIndex: number;
  progression: 'Consecutive' | 'Increasing', // or sequence
}

type Transaction = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  actions: TransactionAction[]
  receiverAccountId: AccountId;
  transactionNonce: TransactionNonce;
  recentBlockHash: BlockHash;
};

// Delegation
type DelegationNonce = {
  scheme: 'SingleNonce',
  value: number,
} | {
  scheme: 'NonceLanes';
  value: number;
  laneIndex: number;
}

type Delegation = {
  delegatorAccountId: AccountId;
  delegatorPublicKey: PublicKey;
  delegatedActions: DelegableAction[];
  receiverAccountId: AccountId;
  delegationNonce: DelegationNonce;
  expiration: { blockHeight: BlockHeight };
}
````

### Option 2

```typescript
// Transaction

const tx = {
  signerAccountId: 'alice',
  signerKey: {
    publicKey: 'ed25519:12312312dadad',
    nonce: {
      scheme: 'NonceLanes',
      newValue: 1, 
      laneIndex: 1,
      progression: 'Consecutive',
    },
  },
  actions: [],
  receiverAccountId: 'bob',
  recentBlockHash: '123abc',
};
````

### Option 3

```typescript
// Transaction

const tx = {
  signerAccountId: 'alice',
  signerKey: {
    publicKey: 'ed25519:12312312dadad',
    nonceScheme: 'NonceLane',
    nonceLaneIndex: 1,
  },
  nonce: {
    value: 1,
    progression: 'Consecutive',
  },
  actions: [],
  receiverAccountId: 'bob',
  recentBlockHash: '123abc',
};
````

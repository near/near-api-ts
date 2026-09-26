
```typescript
// Transaction

type Progression =
  | 'Increasing'  // value > current
  | 'Consecutive'; // value == current + 1

type TransactionReplayProtection = {
  scheme: 'SingleNonceSequence';
  nonce: number,
  nonceProgression: Progression;
} | {
  scheme: 'NonceSequenceSet';
  sequenceId: number; // which sequence of the set: 1..totalSequences
  nonce: number; // the number inside that sequence
  nonceProgression: Progression;
}

type Transaction = {
  signer: {
    accountId: AccountId,
    publicKey: PublicKey,
    replayProtection: TransactionReplayProtection,
  },
  actions: TransactionAction[]
  receiverAccountId: AccountId;
  recentBlockHash: BlockHash;
};
````


### Option 1

```typescript

const tx = {
  signer: {
    accountId: 'alice',
    publicKey: 'ed25519:12312312dadad',
    replayProtection: {
      scheme: 'NonceSequenceSet',
      sequenceId: 1,
      nonce: 1,
      nonceProgression: 'Consecutive',
    },
  },
  actions: [],
  receiverAccountId: 'bob',
  recentBlockHash: '123abc',
};

````




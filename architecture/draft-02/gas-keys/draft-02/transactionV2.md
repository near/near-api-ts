### Primary option

```typescript
// Transaction

type SequentialNonce = number;

type Progression =
  | 'Increasing'  // value > current
  | 'Consecutive'; // value == current + 1

type TransactionReplayProtection = {
  scheme: 'NonceChannel';
  nonce: SequentialNonce,
  nonceProgression?: Progression;
} | {
  scheme: 'NonceChannels';
  nonceChannelId: number;
  nonce: SequentialNonce;
  nonceProgression?: Progression; // default: Consecutive
}

type Transaction = {
  signer: {
    accountId: AccountId,
    publicKey: PublicKey,
    replayProtection: TransactionReplayProtection,
  },
  actions: TransactionAction[] // action: TransactionAction
  receiverAccountId: AccountId;
  recentBlockHash: BlockHash;
};
````


### Example

```typescript

const tx = {
  signer: {
    accountId: 'alice',
    publicKey: 'ed25519:12312312dadad',
    replayProtection: {
      scheme: 'NonceChannels',
      nonceChannelId: 1,
      nonce: 1,
      nonceProgression: 'Increasing',
    },
  },
  actions: [],
  receiverAccountId: 'bob',
  recentBlockHash: '123abc',
};

````


#### Other options

```typescript
Stamp
StampCollections

getStampCollections({ accountId, publicKey })

type Output = {
  stampCollections: [{ collectionId: 1, lastStamp: 1000 }]
}
```

```typescript
client.getAccessKeyNonceChannels({
  accountId: 'bob',
  publicKey: 'ed25519:123abc...'
})

type NonceChannel = {
  channelId: number;
  lastNonce: number
}

type Output = {
  accountId: AccountId;
  publicKey: PublicKey;
  nonceChannels: NonceChannel[]
}
```

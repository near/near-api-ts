### Single relayer - send multiple delegate actions in parallel

Since different relayers may have many different ways to send Delegate Actions
(HTTP, Websocket etc.) to them, we **CANNOT** implement `submitDelegateAction/s` on the NAT side.
Instead, we will provide a simple example how you can create your own adapter and
integrate it into the NAT ecosystem.

1\. Setup keyService. In this example you can use any Signer (Memory/File/LocalStorage etc.)
which supports parallel signing. It means it won't work with LedgerSigner or WalletSelectorSigner

```ts
const client = createClient({ network: mainnet });

const keyService = await createMemoryKeyService({
  keySources: [
    {
      privateKey:
        'ed25519:SLtBFvaoJinTmEKWqdkUBAL38Vffxo6uTcixhVMw2C1rALemo3oh4RToxYygKpXui9XCRtBnaPnmFefm9H6cvN8',
    },
    {
      seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
      derivationPath: `m/44'/397'/0'`,
    },
    {
      seedPhrase: 'usage extend blade goat hip embrace bitter choose robot simple umbrella absorb',
    },
  ],
});
```

2\. Connect relayer adapter, and create RelayerSigner. This Signer will be able to
manage nonce, create and send multiple delegate actions.

Note: `createRelayerSigner` function is a creation of the external developers, and
we have no control over it. All we can expect is that their `relayerSigner` will
follow the convention and will accept NAT `DelegateAction` `DelegateIntention` and that the
`relayerSigner.submitDelegateAction` will be similar to `signer.signDelegateAction`

```ts
const relayerSigner = await createRelayerSigner({
  signerAccountId: 'system.near',
  client,
  keyService,
});
```

3\. Sequentially submit multiple delegate actions

```ts
const action = transfer({ amount: { near: '1.25' } });

await Promise.all([
  relayerSigner.submitDelegateAction({
    delegatedIntention: {
      action,
      receiverAccountId: 'a.near',
      validForBlocks: 1000,
    },
  }),
  relayerSigner.submitDelegateAction({
    delegatedIntention: {
      action,
      receiverAccountId: 'b.near',
      validForBlocks: 2000,
    },
  }),
]);
```

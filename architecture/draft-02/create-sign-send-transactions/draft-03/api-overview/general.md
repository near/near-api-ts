What do we want to have?

On one hand — a simple entity for signing any transactions and messages. It does not manage the nonce and does not send to the network. client or signerId are not required.

On the other hand — a way to manage the nonce and a higher-level mechanism for producing and submitting transactions, not just signing them (as on the lower level). Here, client and signerId are required.

If we combine low-level and high-level functions into a single entity, we’ll end up with a bad mix — there will be a single function that can take various optional parameters (signerId, keyPool), and depending on these parameters, the availability of certain functions (submitTransaction) and the behavior of the entity will differ significantly.

--- 

Instead of having two general functions — createSigner and createSignService — that accept unified + optional parameters, we:

1. Separate all SignService implementations into distinct types, e.g., MemorySignService or LedgerSignService. This allows us to clearly split different types of SignService into independent entities, which will also make it easier to add new SignService types in the future.

2. Instead of a single createSigner, we will create a Submitter from each SignService via its own createSubmitter method. This makes it easy to have a different Submitter interface for various SignService types — for example, some SignServices (like FileSignService) may support Key Pool, while others (like LedgerSignService) will not have such functionality.

--- 

Why SignService instead of Signer?
SignService is perceived as something that can sign transactions for many accounts.
Signer is perceived as something that signs transactions only for a single specific account.

---

What is the best name - Signer, Submitter, or Sender?
This module manages nonce and key pool, helps to avoid passing signerId and signerPublicKey every time.
--- 

Both approaches are equal, but we assume that users will not use signer with 1-key KeyPool.
We won't ban this ability.

```ts
const signer1 = await signService.createSigner({
  signerId: 'system.near',
  signerPublicKey: 'ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv',
  client,
});

const signer2 = await signService.createSigner({
  signerId: 'system.near',
  keyPool: {
    enabled: true,
    keys: ['ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv'],
  },
  client,
});
```

---

We will warn user if he will try to create multiple signers with the same signerId.
The main reason - this could break the nonce management.

```ts
const signer1 = await signService.createSigner({ signerId: 'system.near', client });
const signer2 = await signService.createSigner({ signerId: 'system.near', client });
```

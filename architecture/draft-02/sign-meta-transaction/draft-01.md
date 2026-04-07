```typescript
const sponsorshipRequest = createSponsorshipRequest();

const signedSponsorshipRequest = await alice.signSponsorshipRequest(sponsorshipRequest);

// Low Level
await relayer.executeTransaction({
  intent: {
    action: sponsor(signedSponsorshipRequest),
    receiverAccountId: 'testnet'
  }
});


// High Level
await relayer.executeTransaction(sponsorship({ signedSponsorshipRequest }));

// ----------

const sponsorshipApplication = createSponsorshipApplication();

const signedSponsorshipApplication = await alice.signSponsorshipApplication(sponsorshipApplication);

// Low Level
await relayer.executeTransaction({
  intent: {
    action: sponsor(signedSponsorshipApplication),
    receiverAccountId: 'testnet'
  }
});

await relayer.executeTransaction({
  intent: {
    actions: [
      sponsor(signedSponsorshipApplication),
      transfer({ amount: { near: '1' } })
    ],
    receiverAccountId: 'testnet'
  }
});

// High Level
await relayer.executeTransaction(sponsorship({ signedSponsorshipApplication }));
// OR
await relayer.executeTransaction(createSponsorship({ signedSponsorshipApplication }));
// OR
await relayer.executeTransaction({
  intent: sponsorship({ signedSponsorshipApplication })
});
// OR
await relayer.executeTransaction({
  intent: createSponsorshipIntent({ signedSponsorshipApplication })
});


// Less likely to be used - duplicate Transaction 
await relayer.executeTransaction(createSponsorshipTransaction({ signedSponsorshipApplication }));
// OR
await relayer.executeTransaction(sponsorshipTransaction({ signedSponsorshipApplication }));
```

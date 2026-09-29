```typescript
// #1 Full Access + Account balance key (AccessKeyPermissionView::FullAccess)
addAccessKey({
  publicKey,
  permission: {
    kind: 'FullAccess'
  },
  gasPayment: {
    source: 'AccountBalance'
  },
})

// #2 Full Access + Key balance key (AccessKeyPermissionView::GasKeyFullAccess)
addAccessKey({
  publicKey,
  permission: {
    kind: 'FullAccess'
  },
  gasPayment: {
    source: 'KeyBalance'
  },
  replayProtection: {
    totalSequences: 10,
  }
})

// #3 FunctionCall + Account balance key (AccessKeyPermissionView::FunctionCall)
addAccessKey({
  publicKey,
  permission: {
    kind: 'FunctionCall',
    allowedContract: 'app.near',
    allowedFunctions: 'AllNonPayable'| ['some_method']
  },
  gasPayment: {
    source: 'AccountBalance',
    allowance: 'Unlimited' | near('0.5'),
  },
})

// #4 FunctionCall + Key balance key (AccessKeyPermissionView::FunctionCall)
addAccessKey({
  publicKey,
  permission: {
    kind: 'FunctionCall',
    allowedContract: 'app.near',
    allowedFunctions: 'AllNonPayable' | ['some_method']
  },
  gasPayment: {
    source: 'KeyBalance'
  },
  replayProtection: {
    totalSequences: 10,
  }
})
```



## Account Key

#### Option 1

```typescript
type PublicKeyRef = string;
type SequentialNonce = number;

// ── Debit ────────────────────────────────────────────────────

type KeyA = {
  publicKeyRef: PublicKeyRef;
  permission: {
    kind: 'FullAccess';
  };
  gasPayment: {
    source: 'AccountBalance';
    spendingLimit: 'Unlimited'
  };
  replayProtection: {
    scheme: 'SingleNonceSequence';
    lastNonce: SequentialNonce;
  };
};

type KeyB = {
  publicKeyRef: PublicKeyRef;
  permission: {
    kind: 'FunctionCall';
    allowedContract: AccountId;
    allowedFunctions: AllowedFunctions;
  }
  gasPayment: {
    source: 'AccountBalance';
    spendingLimit: 'Unlimited'
  } | {
    source: 'AccountBalance';
    spendingLimit: 'Limited'
    allowance: NearToken;
  };
  replayProtection: {
    scheme: 'SingleNonceSequence';
    lastNonce: SequentialNonce;
  };
};

// ── Prepaid ──────────────────────────────────────────────────

type KeyC = {
  publicKeyRef: PublicKeyRef;
  permission: {
    kind: 'FullAccess';
  };
  gasPayment: {
    source: 'KeyBalance';
    balance: NearToken;
  };
  replayProtection: {
    scheme: 'NonceSequenceSet';
    totalSequences: number; // 1..1024
  };
};

export type KeyD = {
  publicKeyRef: PublicKeyRef;
  permission: {
    kind: 'FunctionCall';
    allowedContract: AccountId;
    allowedFunctions: AllowedFunctions;
  }
  gasPayment: {
    source: 'KeyBalance';
    balance: NearToken;
  };
  replayProtection: {
    scheme: 'NonceSequenceSet';
    totalSequences: number; // 1..1024
  };
};

export type AccessKey = KeyA | KeyB | KeyC | KeyD;
```

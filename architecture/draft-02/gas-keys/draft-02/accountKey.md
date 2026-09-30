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
    allowance: 'Unlimited'
  };
  replayProtection: {
    scheme: 'NonceChannel';
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
    allowance: 'Unlimited' | NearToken
  }
  replayProtection: {
    scheme: 'NonceChannel';
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
    scheme: 'NonceChannels';
    channelCount: number;
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
    scheme: 'NonceChannels';
    channelCount: number; // 1..1024
  };
};

export type AccessKey = KeyA | KeyB | KeyC | KeyD;
```

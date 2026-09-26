## Account Key

#### Option 1

```typescript
type PublicKeyId = string;
type PublicKeyRef = string;

// ── Debit ────────────────────────────────────────────────────

export type DebitFullAccessKey = {
  publicKeyId: PublicKeyId;
  permission: {
    kind: 'FullAccess';
  };
  gasPayment: {
    source: 'AccountBalance';
  };
  nonces: {
    scheme: 'SingleNonce';
    nonce: number; // or value?
  };
};

export type DebitFunctionCallKey = {
  publicKeyId: PublicKeyId;
  access: {
    kind: 'FunctionCall';
    allowedContract: AccountId;
    allowedFunctions: AllowedFunctions;
  }
  gasPayment: {
    source: 'AccountBalance';
    allowance: 'Unlimited' | NearToken;
  };
  nonces: {
    scheme: 'SingleNonce';
    nonce: number; 
  };
};

// ── Prepaid ──────────────────────────────────────────────────

export type PrepaidFullAccessKey = {
  publicKeyId: PublicKeyId;
  permission: {
    accessType: 'FullAccess';
  };
  gasPayment: {
    source: 'KeyBalance';
    balance: NearToken;
  };
  nonces: {
    scheme: 'ConcurrentNonces'; // NonceCapacity ? // MultipleNonces ?? // ConcurrentNonces
    // nonceLaneCount: number;
    // nonceConcurencyLimit: 1
    concurrentNonceLimit: 1
  };
  
  // 1 lane / 1 track / l
  
  // load balancer ???
  // ConcurencyLimit ??
  
  // max nonces
};

export type PrepaidFunctionCallKey = {
  publicKeyId: PublicKeyId;
  permission: {
    accessType: 'FunctionCall';
    contractAccountId: AccountId;
    allowedFunctions: AllowedFunctions;
  }
  gasPayment: {
    source: 'KeyBalance';
    balance: NearToken;
  };
  nonces: {
    scheme: 'NonceLanes';
    nonceLaneCount: number;
  };
};

type DebitKey = DebitFullAccessKey | DebitFunctionCallKey;
type PrepaidKey = PrepaidFullAccessKey | PrepaidFunctionCallKey;

export type AccountAccessKey = DebitKey | PrepaidKey;

// client.getAccountKey / client.getAccountKeys
```

#### Option 2

```typescript
type PublicKeyId = string;

export type DebitFullAccessKey = {
  keyType: 'DebitFullAccess',
  publicKeyId: PublicKeyId;
  nonce: number;
};

export type DebitFunctionCallKey = {
  keyType: 'DebitFunctionCall',
  publicKeyId: PublicKeyId;
  nonce: number;
  permission: {
    contractAccountId: AccountId;
    allowedFunctions: AllowedFunctions;
    gasAllowance: 'Unlimited' | NearToken; // or allowedGasExpense
  }
};

// ── Prepaid ──────────────────────────────────────────────────

export type PrepaidFullAccessKey = {
  keyType: 'PrepaidFullAccess',
  publicKeyId: PublicKeyId;
  nonceLaneCount: number;
  gasBalance: NearToken;
};

export type PrepaidFunctionCallKey = {
  keyType: 'PrepaidFunctionCall',
  publicKeyId: PublicKeyId;
  nonceLaneCount: number;
  gasBalance: NearToken;
  permission: {
    contractAccountId: AccountId;
    allowedFunctions: AllowedFunctions;
  }
};

type DebitKey = DebitFullAccessKey | DebitFunctionCallKey;
type PrepaidKey = PrepaidFullAccessKey | PrepaidFunctionCallKey;

export type AccountKey = DebitKey | PrepaidKey;
```


#### Option 3

```typescript
type PublicKeyId = string;

export type DebitFullAccessKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Debit';
  accessType: 'FullAccess';
  nonce: number;
};

export type DebitFunctionCallKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Debit';
  accessType: 'FunctionCall';
  restrictions: {
    allowedContract: AccountId;
    allowedFunctions: AllowedFunctions;
  }
  nonce: number;
  gasAllowance: 'Unlimited' | NearToken;
};

// ── Prepaid ──────────────────────────────────────────────────

export type PrepaidFullAccessKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Prepaid',
  accessType: 'FullAccess';
  nonceLaneCount: number;
  gasBalance: NearToken;
};

export type PrepaidFunctionCallKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Prepaid',
  accessType: 'FunctionCall';
  restrictions: {
    contractAccountId: AccountId;
    allowedFunctions: AllowedFunctions;
  }
  nonceLaneCount: number;
  gasBalance: NearToken;
};
````

#### Option 4

```typescript
type PublicKeyId = string;

export type DebitFullAccessKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Debit';
  accessType: 'FullAccess';
  nonce: number;
};

export type DebitFunctionCallKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Debit';
  accessType: 'FunctionCall';
  nonce: number;
  gasAllowance: 'Unlimited' | NearToken;
  allowedContract: AccountId;
  allowedFunctions: AllowedFunctions;
};

// ── Prepaid ──────────────────────────────────────────────────

export type PrepaidFullAccessKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Prepaid',
  accessType: 'FullAccess';
  nonceLaneCount: number;
  gasBalance: NearToken;
};

export type PrepaidFunctionCallKey = {
  publicKeyId: PublicKeyId;
  keyType: 'Prepaid',
  accessType: 'FunctionCall';
  nonceLaneCount: number;
  gasBalance: NearToken;
  contractAccountId: AccountId;
  allowedFunctions: AllowedFunctions;
};
````

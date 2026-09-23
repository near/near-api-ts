```rust
pub struct TransferToGasKeyAction {
    pub public_key: PublicKey, /// TODO Why not a PublicKeyHandle ?????
    pub deposit: Balance,
}

pub struct WithdrawFromGasKeyAction {
  pub public_key: PublicKey, /// TODO Why not a PublicKeyHandle ?????
  pub amount: Balance,
}
```


```typescript



// FundAccountKey / DrainAccountKey ?
// FundPrepaidKey / DrainPrepaidKey ?
// FundPrepaidKey / DrainPrepaidKey ?

```

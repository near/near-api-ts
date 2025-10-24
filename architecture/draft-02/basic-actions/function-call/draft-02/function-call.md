
```ts
functionCall({
  name: 'ft_transfer',
  jsonArgs: {
    account_id: 'bob.near',
  },
  gasLimit: { teraGas: '20' },
  attachedDeposit: { yoctoNear: 1n },
})
```


```ts
class Token {
    yoctoNear: bigint;

    constructor(_token: string) {
        this.yoctoNear = 1n;
    }

    toString() {}

    greaterThan() {}
}

// type NearToken = Token<24>;

class NearToken {
    yoctoNear: bigint;

    constructor(_token: string) {
        this.yoctoNear = 1n;
    }

    toString() {}

    greaterThan() {}
}

function functionCall({attachedDeposit}: { attachedDeposit: { yoctoNear: bigint } | { near: string } | { decimals: 24, amount: bigint } }) {
    console.log(attachedDeposit);
}

functionCall({ attachedDeposit: { yoctoNear: 1n } });

interface NEARInterface {
    yoctoNear: bigint;
    greaterThan: ({ yoctoNear: bigint } | { near: string }) => boolean;
}

function NEAR(value: string): NEARInterface {
    return {
        yoctoNear: 1n, 
        greaterThan: (v) => true,
        // add: () => NEARInterface,
    }
}

const REQUIRED_ATTACHMENT = NEAR("1.5");
functionCall({ attachedDeposit: REQUIRED_ATTACHMENT });

const accountBalance = NEAR("1.5");
if (accountBalance < REQUIRED_ATTACHMENT) {
  
}

if (accountBalance.greaterThan(REQUIRED_ATTACHMENT)) {
  
}

if (accountBalance.greaterThan({ near: "1.5" })) {
  
}

```

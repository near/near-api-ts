const CodeHashDeployModeBorshSchema = {
  struct: {
    codeHash: { struct: {} },
  },
};

const AccountIdDeployModeBorshSchema = {
  struct: {
    accountId: { struct: {} },
  },
};

// Both register-global-contract actions serialize as nearcore's single DeployGlobalContract
// variant. The deploy mode distinguishes whether the contract is pinnable or linkable.
export const DeployGlobalContractActionBorshSchema = {
  struct: {
    deployGlobalContract: {
      struct: {
        code: { array: { type: 'u8' } },
        deployMode: {
          enum: [CodeHashDeployModeBorshSchema, AccountIdDeployModeBorshSchema],
        },
      },
    },
  },
};

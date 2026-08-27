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

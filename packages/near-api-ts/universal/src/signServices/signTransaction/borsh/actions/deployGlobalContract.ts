const CodeHashModeBorshSchema = {
  struct: {
    CodeHash: { struct: {} },
  },
};

const AccountIdModeBorshSchema = {
  struct: {
    AccountId: { struct: {} },
  },
};

export const DeployGlobalContractActionBorshSchema = {
  struct: {
    deployGlobalContract: {
      struct: {
        code: { array: { type: 'u8' } },
        deployMode: {
          enum: [CodeHashModeBorshSchema, AccountIdModeBorshSchema],
        },
      },
    },
  },
};

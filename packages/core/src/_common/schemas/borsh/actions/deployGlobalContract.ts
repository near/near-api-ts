const codeHashModeBorshSchema = {
  struct: {
    CodeHash: { struct: {} },
  },
};

const accountIdModeBorshSchema = {
  struct: {
    AccountId: { struct: {} },
  },
};

export const deployGlobalContractActionBorshSchema = {
  struct: {
    deployGlobalContract: {
      struct: {
        code: { array: { type: 'u8' } },
        deployMode: {
          enum: [codeHashModeBorshSchema, accountIdModeBorshSchema],
        },
      },
    },
  },
};

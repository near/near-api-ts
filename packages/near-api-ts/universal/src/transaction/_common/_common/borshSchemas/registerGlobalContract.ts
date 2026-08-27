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

export const RegisterGlobalContractActionBorshSchema = {
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

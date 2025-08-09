const codeHashIdentifierBorshSchema = {
  struct: {
    CodeHash: { array: { type: 'u8', len: 32 } },
  },
};

const accountIdIdentifierBorshSchema = {
  struct: {
    AccountId: 'string',
  },
};

export const useGlobalContractActionBorshSchema = {
  struct: {
    useGlobalContract: {
      struct: {
        contractIdentifier: {
          enum: [codeHashIdentifierBorshSchema, accountIdIdentifierBorshSchema],
        },
      },
    },
  },
};

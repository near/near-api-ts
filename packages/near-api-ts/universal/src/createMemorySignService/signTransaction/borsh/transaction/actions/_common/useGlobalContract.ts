const CodeHashIdentifierBorshSchema = {
  struct: {
    CodeHash: { array: { type: 'u8', len: 32 } },
  },
};

const AccountIdIdentifierBorshSchema = {
  struct: {
    AccountId: 'string',
  },
};

export const UseGlobalContractActionBorshSchema = {
  struct: {
    useGlobalContract: {
      struct: {
        contractIdentifier: {
          enum: [CodeHashIdentifierBorshSchema, AccountIdIdentifierBorshSchema],
        },
      },
    },
  },
};

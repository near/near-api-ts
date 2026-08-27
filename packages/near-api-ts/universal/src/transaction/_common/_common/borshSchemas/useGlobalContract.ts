const CodeHashIdentifierBorshSchema = {
  struct: {
    codeHash: { array: { type: 'u8', len: 32 } },
  },
};

const AccountIdIdentifierBorshSchema = {
  struct: {
    accountId: 'string',
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

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

// Nearcore has a single `UseGlobalContract` action whose identifier picks the
// code, so both of our actions - `PinGlobalContract` (code hash) and
// `LinkGlobalContract` (account id) - serialize through this one enum variant.
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

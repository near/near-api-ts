export const deployContractActionBorshSchema = {
  struct: {
    deployContract: {
      struct: {
        code: { array: { type: 'u8' } },
      },
    },
  },
};

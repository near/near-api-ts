export const DeployContractActionBorshSchema = {
  struct: {
    deployContract: {
      struct: {
        code: { array: { type: 'u8' } },
      },
    },
  },
};

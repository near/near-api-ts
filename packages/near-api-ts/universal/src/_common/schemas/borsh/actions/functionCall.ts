export const functionCallActionBorshSchema = {
  struct: {
    functionCall: {
      struct: {
        methodName: 'string',
        args: { array: { type: 'u8' } },
        gas: 'u64',
        deposit: 'u128',
      },
    },
  },
};

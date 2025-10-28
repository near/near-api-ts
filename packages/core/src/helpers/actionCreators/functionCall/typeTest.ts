import { functionCall } from './functionCall';

const functionName = 'test';
const gasLimit = { teraGas: '100' };

const res1 = functionCall({
  functionName,
  gasLimit,
});

const res2 = functionCall<undefined>({
  functionName,
  gasLimit,
});

const res3 = functionCall({
  functionName,
  gasLimit,
  functionArgs: undefined,
});

const res4 = functionCall({
  functionName,
  gasLimit,
  functionArgs: { a: 1 },
  options: {
    serializeArgs: (_args) => new Uint8Array(1),
  },
});

const res5 = functionCall({
  functionName,
  gasLimit,
  options: {
    serializeArgs: (_) => new Uint8Array(1),
  },
});

const res6 = functionCall<(args: { functionArgs: undefined }) => Uint8Array>({
  functionName,
  gasLimit,
  options: {
    serializeArgs: () => new Uint8Array(1),
  },
});

const res7 = functionCall<(args: { functionArgs: number }) => Uint8Array>({
  functionName,
  gasLimit,
  functionArgs: 1,
  options: {
    serializeArgs: (_) => new Uint8Array(1),
  },
});

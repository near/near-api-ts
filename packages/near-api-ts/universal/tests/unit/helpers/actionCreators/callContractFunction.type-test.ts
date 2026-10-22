import type { CallContractFunctionAction } from '../../../../index';
import { callContractFunction, safeCallContractFunction, teraGas } from '../../../../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

type SuccessData<R> = R extends { success: true; data: infer D } ? D : never;

const functionName = 'create';
const gasLimit = teraGas('10');

const serializeBigintArgs = (_args: { functionArgs: { b: bigint } }) => new Uint8Array(1);
const serializeEmptyArgs = (_args: { functionArgs?: never }) => new Uint8Array(1);

// OVERLOAD #1 - maybe JSON-like functionArgs, no serializeArgs.
// The return type is always CallContractFunctionAction regardless of the args shape.

const a10 = callContractFunction({ functionName, gasLimit });
type _A10 = Assert<Equal<typeof a10, CallContractFunctionAction>>;

const a11 = callContractFunction<undefined>({ functionName, gasLimit });
type _A11 = Assert<Equal<typeof a11, CallContractFunctionAction>>;

const a12 = callContractFunction({ functionName, gasLimit, functionArgs: undefined });
type _A12 = Assert<Equal<typeof a12, CallContractFunctionAction>>;

const a13 = callContractFunction({ functionName, gasLimit, functionArgs: { a: 1 } });
type _A13 = Assert<Equal<typeof a13, CallContractFunctionAction>>;

const a14 = callContractFunction({ functionName, gasLimit, functionArgs: 1 });
type _A14 = Assert<Equal<typeof a14, CallContractFunctionAction>>;

const a15 = callContractFunction({ functionName, gasLimit, attachedDeposit: { yoctoNear: 1n } });
type _A15 = Assert<Equal<typeof a15, CallContractFunctionAction>>;

// OVERLOAD #2 - a custom serializeArgs drives the functionArgs type,
// so non-JSON values (e.g. bigint) are allowed here.

const a20 = callContractFunction({
  functionName,
  gasLimit,
  options: { serializeArgs: serializeEmptyArgs },
});
type _A20 = Assert<Equal<typeof a20, CallContractFunctionAction>>;

const a21 = callContractFunction({
  functionName,
  gasLimit,
  functionArgs: { b: 1n },
  options: { serializeArgs: serializeBigintArgs },
});
type _A21 = Assert<Equal<typeof a21, CallContractFunctionAction>>;

const a22 = callContractFunction<(args: { functionArgs: { b: bigint } }) => Uint8Array>({
  functionName,
  gasLimit,
  functionArgs: { b: 1n },
  options: { serializeArgs: serializeBigintArgs },
});
type _A22 = Assert<Equal<typeof a22, CallContractFunctionAction>>;

// safeCallContractFunction returns a Result whose success-branch data is CallContractFunctionAction.

const s10 = safeCallContractFunction({ functionName, gasLimit });
type _S10 = Assert<Equal<SuccessData<typeof s10>, CallContractFunctionAction>>;

const s11 = safeCallContractFunction({
  functionName,
  gasLimit,
  functionArgs: { b: 1n },
  options: { serializeArgs: serializeBigintArgs },
});
type _S11 = Assert<Equal<SuccessData<typeof s11>, CallContractFunctionAction>>;

// ---- Negative cases ----

// @ts-expect-error overload #1 rejects non-JSON-like (bigint) functionArgs
callContractFunction({ functionName, gasLimit, functionArgs: { bad: 1n } });

// @ts-expect-error gasLimit is required
callContractFunction({ functionName });

callContractFunction({
  functionName,
  gasLimit,
  options: {
    // @ts-expect-error serializeArgs must return Uint8Array
    serializeArgs: () => 1,
  },
});

callContractFunction<(args: { functionArgs: { b: bigint } }) => Uint8Array>({
  functionName,
  gasLimit,
  // @ts-expect-error functionArgs must match the serializer's input type
  functionArgs: { b: '1' },
  options: { serializeArgs: serializeBigintArgs },
});

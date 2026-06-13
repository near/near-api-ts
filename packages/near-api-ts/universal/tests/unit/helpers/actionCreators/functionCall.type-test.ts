import { functionCall, safeFunctionCall, teraGas } from '../../../../index';
import type { FunctionCallAction } from '../../../../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

type OkValue<R> = R extends { ok: true; value: infer V } ? V : never;

const functionName = 'create';
const gasLimit = teraGas('10');

const serializeBigintArgs = (_args: { functionArgs: { b: bigint } }) => new Uint8Array(1);
const serializeEmptyArgs = (_args: { functionArgs?: never }) => new Uint8Array(1);

// OVERLOAD #1 - maybe JSON-like functionArgs, no serializeArgs.
// The return type is always FunctionCallAction regardless of the args shape.

const a10 = functionCall({ functionName, gasLimit });
type _A10 = Assert<Equal<typeof a10, FunctionCallAction>>;

const a11 = functionCall<undefined>({ functionName, gasLimit });
type _A11 = Assert<Equal<typeof a11, FunctionCallAction>>;

const a12 = functionCall({ functionName, gasLimit, functionArgs: undefined });
type _A12 = Assert<Equal<typeof a12, FunctionCallAction>>;

const a13 = functionCall({ functionName, gasLimit, functionArgs: { a: 1 } });
type _A13 = Assert<Equal<typeof a13, FunctionCallAction>>;

const a14 = functionCall({ functionName, gasLimit, functionArgs: 1 });
type _A14 = Assert<Equal<typeof a14, FunctionCallAction>>;

const a15 = functionCall({ functionName, gasLimit, attachedDeposit: { yoctoNear: 1n } });
type _A15 = Assert<Equal<typeof a15, FunctionCallAction>>;

// OVERLOAD #2 - a custom serializeArgs drives the functionArgs type,
// so non-JSON values (e.g. bigint) are allowed here.

const a20 = functionCall({
  functionName,
  gasLimit,
  options: { serializeArgs: serializeEmptyArgs },
});
type _A20 = Assert<Equal<typeof a20, FunctionCallAction>>;

const a21 = functionCall({
  functionName,
  gasLimit,
  functionArgs: { b: 1n },
  options: { serializeArgs: serializeBigintArgs },
});
type _A21 = Assert<Equal<typeof a21, FunctionCallAction>>;

const a22 = functionCall<(args: { functionArgs: { b: bigint } }) => Uint8Array>({
  functionName,
  gasLimit,
  functionArgs: { b: 1n },
  options: { serializeArgs: serializeBigintArgs },
});
type _A22 = Assert<Equal<typeof a22, FunctionCallAction>>;

// safeFunctionCall returns a Result whose ok-branch value is FunctionCallAction.

const s10 = safeFunctionCall({ functionName, gasLimit });
type _S10 = Assert<Equal<OkValue<typeof s10>, FunctionCallAction>>;

const s11 = safeFunctionCall({
  functionName,
  gasLimit,
  functionArgs: { b: 1n },
  options: { serializeArgs: serializeBigintArgs },
});
type _S11 = Assert<Equal<OkValue<typeof s11>, FunctionCallAction>>;

// ---- Negative cases ----

// @ts-expect-error overload #1 rejects non-JSON-like (bigint) functionArgs
functionCall({ functionName, gasLimit, functionArgs: { bad: 1n } });

// @ts-expect-error gasLimit is required
functionCall({ functionName });

// @ts-expect-error serializeArgs must return Uint8Array
functionCall({
  functionName,
  gasLimit,
  options: {
    serializeArgs: () => 1,
  },
});

functionCall<(args: { functionArgs: { b: bigint } }) => Uint8Array>({
  functionName,
  gasLimit,
  // @ts-expect-error functionArgs must match the serializer's input type
  functionArgs: { b: '1' },
  options: { serializeArgs: serializeBigintArgs },
});

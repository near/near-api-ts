// import './transactions/createAccount';
// import './transactions/deleteAccount';
// import './transactions/transfer';
// import './transactions/addFunctionCallKey';
// import './transactions/functionCall';
// import './transactions/deleteKey';
// import './transactions/deployContract';

// import './calls/getAccount';
// import './calls/callContractReadFunction';

// import './transactions/signer/transfer';
//import './transactions/signer/functionCall';

type DefaultTransformFn = (v: number[]) => unknown;
const defaultTransformFn: DefaultTransformFn = (_v) => 'something';

type Args<A, F extends DefaultTransformFn | undefined> = [F] extends [
  DefaultTransformFn,
]
  ? { jsonArgs: A; transformFn: F }
  : { jsonArgs: A };

type Result<F extends DefaultTransformFn | unknown> = [F] extends [
  DefaultTransformFn,
]
  ? { result: ReturnType<F> }
  : { result: unknown };

// Overload order matters
type CallFn = {
  <A, F extends DefaultTransformFn>(args: Args<A, F>): Result<F>;
  <A>(args: Args<A, undefined>): Result<unknown>;
};

const callFn: CallFn = <A, F extends DefaultTransformFn>(args: {
  jsonArgs: A;
  transformFn?: F;
}) => {
  if (args.transformFn) {
    return { result: args.transformFn([1]), b: 1 };
  }
  return { result: defaultTransformFn([1]) };
};

const customFn = (v: number[]) => ({ a: 1 });
type InputArgs = { a: number };

// OK
//  { result: unknown }
const r1 = callFn({ jsonArgs: {} });
// { result: { a: number } }
const r2 = callFn({ jsonArgs: {}, transformFn: customFn });
// { result: unknown }
const r3 = callFn<InputArgs>({ jsonArgs: { a: 1 } });
//{ result: { a: number } }
const r4 = callFn<InputArgs, typeof customFn>({
  jsonArgs: { a: 1 },
  transformFn: customFn,
});

const args5 = {
  jsonArgs: { a: 1 },
  transformFn: customFn,
};
//{ result: { a: number } }
const r5 = callFn(args5);

// ERROR
// const r100 = callFn<InputArgs>({
//   jsonArgs: { a: 1 },
//   transformFn: customFn,
// });
//
// const r101 = callFn<{ b: number }, (v: number[]) => { a1: number }>({
//   jsonArgs: { b: 1 },
// });

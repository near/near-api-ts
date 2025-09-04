// import './transactions/createAccount';
// import './transactions/deleteAccount';
// import './transactions/transfer';
// import './transactions/addFunctionCallKey';
// import './transactions/functionCall';
// import './transactions/deleteKey';
// import './transactions/deployContract';

// import './calls/getAccount';
import './calls/callContractReadFunction';

// import './transactions/signer/transfer';
//import './transactions/signer/functionCall';

// type BaseTransformFn = (v: number[]) => unknown
//
// type Args<A, F extends BaseTransformFn> = {
//   jsonArgs: A;
//   transformFn?: F;
// };
//
// type Result<A, F extends BaseTransformFn> = {
//   result: ReturnType<F>;
// };
//
// const defaultTransformFn = (v: number[]): unknown => {
//   return 'something';
// };
//
// const customTransformFn = (v: number[]): { a: number } => {
//   return { a: 1 };
// };
//
// const callFn = <A, F>(args: Args<A>): Result<A, F> => {
//   const transformFn = args?.transformFn ?? defaultTransformFn;
//   return transformFn([1]);
// };
//
// const res1 = callFn({ jsonArgs: {} })
// console.log(res1);

type DefaultTransformFn = (v: number[]) => unknown;

type Result<F extends DefaultTransformFn | undefined> = [F] extends [
  DefaultTransformFn,
]
  ? {
      result: ReturnType<F>;
    }
  : { result: unknown };

type Args<A, F extends DefaultTransformFn | undefined> = {
  jsonArgs: A;
} & ([F] extends [DefaultTransformFn]
  ? { transformFn: F }
  : { transformFn?: never });

const defaultTransformFn: DefaultTransformFn = (_v) => 'something';

const callFn = <A, F extends DefaultTransformFn | undefined = undefined>(
  args: Args<A, F>,
): Result<F> => {
  const transform = args.transformFn ?? defaultTransformFn; // невеликий cast лишається
  return { result: transform([1]) } as Result<F>;
};

const customFn = (v: number[]) => ({ a: 1 });

// Перевірки
const r1 = callFn({ jsonArgs: {} }); // { result: unknown }
const r2 = callFn({ jsonArgs: {}, transformFn: customFn });
const r3 = callFn<{ b: number }>({ jsonArgs: { b: 1 } });

const r4 = callFn<{ b: number }, (v: number[]) => { a: number }>({
  jsonArgs: { b: 1 },
  transformFn: customFn,
});

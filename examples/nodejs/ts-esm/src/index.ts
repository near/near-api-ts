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
  ? { fnArgs: A; transformFn: F }
  : { fnArgs: A };

type Result<F extends DefaultTransformFn | undefined> = [F] extends [
  DefaultTransformFn,
]
  ? { result: ReturnType<F> }
  : { result: unknown };

// Overload order matters
type CallFn = {
  <A, F extends DefaultTransformFn>(args: Args<A, F>): Result<F>;
  <A>(args: Args<A, undefined>): Result<undefined>;
};

const callFn: CallFn = <A, F extends DefaultTransformFn>(args: {
  fnArgs: A;
  transformFn?: F;
}) => {
  if (args.transformFn) {
    return { result: args.transformFn([1]) };
  }
  return { result: defaultTransformFn([1]) };
};

const customFn = (_v: number[]) => ({ a: 1 });
type InputArgs = { a: number };

// OK
//  { result: unknown }
const r1 = callFn({ fnArgs: {} });
// { result: { a: number } }
const r2 = callFn({ fnArgs: {}, transformFn: customFn });
// { result: unknown }
const r3 = callFn<InputArgs>({ fnArgs: { a: 1 } });
//{ result: { a: number } }
const r4 = callFn<InputArgs, typeof customFn>({
  fnArgs: { a: 1 },
  transformFn: customFn,
});

const args5 = {
  fnArgs: { a: 1 },
  transformFn: customFn,
};
// { result: unknown } // ????? It works well for old objects
const r5 = callFn<InputArgs>(args5);
//{ result: { a: number } }
const r6 = callFn(args5);


// ERROR
// const r100 = callFn<InputArgs>({
//   fnArgs: { a: 1 },
//   transformFn: customFn,
// });
//
// const r101 = callFn<{ b: number }, (v: number[]) => { a1: number }>({
//   fnArgs: { b: 1 },
// });


/*
const request = ftContractInterface.readFns.getFtBalance({
  contractAccountId: 'ft.near',
  fnArgs: { accountId: 'alice.near' },
  options: {
    finality: 'OPTIMISTIC', // optional, default: near-final
  },
});

await client.callContractReadFunction(request);
 */

import * as z from 'zod/mini';

const DataSchema = z.object({
  nameFor: z.string(),
});

type DataType = z.output<typeof DataSchema>;

const resultTransformer = (v: number[]): DataType => {
  const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(v)));
  return DataSchema.parse(obj);
};

type GetFtBalanceResult = {
  fnArgs: { account_id: string };
  transformFn: (v: number[]) => DataType;
};

const getFtBalance = (args: { accountId: string }): GetFtBalanceResult => {
  return {
    fnArgs: {
      account_id: args.accountId,
    },
    transformFn: resultTransformer,
  };
};

// { result: { nameFor: string } }
const r0 = callFn(getFtBalance({ accountId: '1d' }));

const a = r0.result.nameFor

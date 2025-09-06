import * as z from 'zod/mini';

function message(person: string): string;
function message(persons: string[]): string[];

function message(person: unknown): unknown {
  return 1
}

const a = message('a'); //  a: string
const a2 = message(['a']); //  a2: string[]

/******************************************************************************/

type JsonLikeValue =
  | string
  | number
  | boolean
  | null
  | JsonLikeValue[]
  | { [key: string]: JsonLikeValue | undefined };
type MaybeJsonLikeValue = JsonLikeValue | undefined;

type DefaultTransformFn = (v: number[]) => unknown;
type MaybeDefaultTransformFn = DefaultTransformFn | undefined;

const defaultTransformFn: DefaultTransformFn = (_v) => 'something';

export type FnArgsJson<A extends JsonLikeValue> = {
  fnArgsJson: A;
  fnArgsJsonBytes?: never;
};
export type FnArgsBytes = { fnArgsJson?: never; fnArgsJsonBytes?: Uint8Array };

export type FnArgs<A extends MaybeJsonLikeValue> = [A] extends [JsonLikeValue]
  ? FnArgsJson<A>
  : FnArgsBytes;

type TransformFn<F extends MaybeDefaultTransformFn> = [F] extends [
    DefaultTransformFn,
  ]
  ? { transformFn: F }
  : { transformFn?: never };

type ResponseArgs<F extends MaybeDefaultTransformFn> = {
  timeout?: number;
} & TransformFn<F>;

type Args<A extends MaybeJsonLikeValue, F extends MaybeDefaultTransformFn> = [
  F,
] extends [DefaultTransformFn]
  ? { id: string; response: ResponseArgs<F> } & FnArgs<A>
  : { id: string; response?: ResponseArgs<F> } & FnArgs<A>;

type Result<F extends MaybeDefaultTransformFn> = [F] extends [
    DefaultTransformFn,
  ]
  ? { result: ReturnType<F> }
  : { result: unknown };

type CallFn = <
  A extends MaybeJsonLikeValue = undefined,
  F extends MaybeDefaultTransformFn = undefined,
>(
  args: Args<A, F>,
) => Result<F>;

const callFn = ((args) => {
  if (args.response?.transformFn) {
    return { result: args.response.transformFn([1]) };
  }
  return { result: defaultTransformFn([1]) };
}) as CallFn;

const customFn = (_v: number[]) => ({ a: 1 });
type InputArgs = { a: number };

// OK
// // WITH ARGS TEST
//  { result: unknown }
const r1 = callFn({ id: 'a', fnArgsJson: { a: 1 } });
// { result: { a: number } }
const r2 = callFn({
  id: 'a',
  fnArgsJson: undefined,
  response: { transformFn: customFn },
});
// { result: unknown }
const r3 = callFn<InputArgs>({ id: 'a', fnArgsJson: { a: 1 } });
//{ result: { a: number } }
const r4 = callFn<undefined, typeof customFn>({
  id: 'a',
  // fnArgsJson: { a: 1 },
  response: { transformFn: customFn },
});

const args5 = { id: 'a', fnArgsJson: { a: 1 } };
//  { result: unknown }
const r6 = callFn<InputArgs>(args5);

// NO ARGS TEST

//  { result: unknown }
const r21 = callFn({ id: 'a' });
// { result: { a: number } }
const r22 = callFn({
  id: 'a',
  fnArgsJsonBytes: new Uint8Array(),
  response: { transformFn: customFn },
});
// { result: unknown }
const r23 = callFn<InputArgs>({
  id: 'a',
  fnArgsJson: { a: 1 },
});
//{ result: { a: number } }
const r24 = callFn<undefined, typeof customFn>({
  id: 'a',
  fnArgsJsonBytes: new Uint8Array(),
  response: { transformFn: customFn },
});

const args25 = {
  id: 'a',
  fnArgsJson: { c: 1 },
  response: { transformFn: customFn },
};
//{ result: { a: number } }
const r26 = callFn(args25);

// ERROR
const args1025 = {
  id: 'a',
  fnArgsJson: { a: 1 },
  response: { transformFn: customFn },
};
callFn<InputArgs>(args1025);

callFn<InputArgs>({
  id: 'a',
  fnArgsJson: { a: 1 },
  response: { transformFn: customFn },
});

callFn<{ b: number }, (v: number[]) => { a1: number }>({
  fnArgsJson: { c: 1 },
  response: { transformFn: customFn },
});

/*
const request = ftContractInterface.readFns.getFtBalance({
  contractAccountId: 'ft.near',
  fnArgsJson: { accountId: 'alice.near' },
  options: {
    finality: 'OPTIMISTIC', // optional, default: near-final
  },
});

await client.callContractReadFunction(request);
*/

const DataSchema = z.object({
  nameFor: z.string(),
});

type DataType = z.output<typeof DataSchema>;

const resultTransformer = (v: number[]): DataType => {
  const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(v)));
  return DataSchema.parse(obj);
};

type GetFtBalanceResult = {
  id: string;
  fnArgsJson: { account_id: string };
  // response?: { transformFn: (v: number[]) => DataType; }
};

const getFtBalance = (args: { accountId: string }) => {
  return {
    id: 'a',
    fnArgsJson: {
      account_id: args.accountId,
    },
    response: { transformFn: resultTransformer },
  };
};

const ac = getFtBalance({ accountId: '1d' });

// { result: { nameFor: string } }
const r0 = callFn(ac);

const a23 = r0.result.nameFor;

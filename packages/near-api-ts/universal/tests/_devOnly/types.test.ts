import { test } from 'vitest';
import type { KeyIf } from '../../types/utils';

type DefaultDeserializeDataFn = (raw: string) => unknown;
type MaybeDefaultDeserializeDataFn = DefaultDeserializeDataFn | undefined;

type DefaultDeserializeReceiptFn = (raw: { receiptId: string }) => unknown;
type MaybeDefaultDeserializeReceiptFn = DefaultDeserializeReceiptFn | undefined;

type DefaultDeserializeLogsFn = (raw: { log: string | number }[]) => unknown;

type GetResultOutputSuccessData<DD extends MaybeDefaultDeserializeDataFn> = [DD] extends [
  DefaultDeserializeDataFn,
]
  ? { data: ReturnType<DD> }
  : { data: unknown };

type GetResultOutputSuccessReceipt<DR extends MaybeDefaultDeserializeReceiptFn> = [DR] extends [
  DefaultDeserializeReceiptFn,
]
  ? { receipt: ReturnType<DR> }
  : { receipt: unknown };

type GetResultOutput<
  DD extends MaybeDefaultDeserializeDataFn,
  DR extends MaybeDefaultDeserializeReceiptFn,
> =
  | {
      result: { status: 'success' } & GetResultOutputSuccessData<DD> &
        GetResultOutputSuccessReceipt<DR>;
    }
  | {
      result: {
        status: 'error';
        message: string;
      };
    };

// ARGS

type Options<
  DD extends MaybeDefaultDeserializeDataFn = undefined,
  DR extends MaybeDefaultDeserializeReceiptFn = undefined,
> = [DD, DR] extends [undefined, undefined]
  ? {
      options?: {
        signal?: AbortSignal;
        deserializeData?: never;
        deserializeReceipt?: never;
      };
    }
  : {
      options: { signal?: AbortSignal } & KeyIf<'deserializeData', DD> &
        KeyIf<'deserializeReceipt', DR>;
    };

const getResult = <
  DD extends MaybeDefaultDeserializeDataFn = undefined,
  DR extends MaybeDefaultDeserializeReceiptFn = undefined,
>(
  args: {
    transactionHash: string;
  } & Options<DD, DR>,
): GetResultOutput<DD, DR> => {
  const rawData = 'someData';
  const rawReceipt = { receiptId: '123' };
  // const rawLogs = [{ log: 'hello' }, { log: 123 }];

  return {
    result: {
      status: 'success',
      data: args.options?.deserializeData ? args.options.deserializeData(rawData) : rawData,
      receipt: args.options?.deserializeReceipt
        ? args.options.deserializeReceipt(rawReceipt)
        : rawReceipt,
      // logs: args.options?.deserializeLogs ? args.options.deserializeLogs(rawLogs) : rawLogs,
    },
  } as GetResultOutput<DD, DR>;
};

/// TESTING

const x1 = getResult({
  transactionHash: '213',
});
if (x1.result.status === 'success') {
  const x = x1.result.data; // unknown
}


const x2 = getResult({
  transactionHash: '213',
  options: {
    deserializeData: (raw: string) => ({ a: 1 }),
  },
});
if (x2.result.status === 'success') {
  const x = x2.result.data; // { a: number }
}


const x3 = getResult<
  (raw: string) => { x: bigint },
  (raw: { receiptId: string }) => [number, string]
>({
  transactionHash: 'abc',
  options: {
    deserializeData: () => ({ x: 1n }),
    deserializeReceipt: () => [1, 's'],
  },
});
if (x3.result.status === 'success') {
  const d = x3.result.data;
  const x = x3.result.receipt;
  // const l = x3.result.logs;
}

test('Test', async () => {});

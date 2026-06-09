import * as z from 'zod/mini';
import { createTestnetClient } from '../../../../../src/client/presets/testnet';
import type { Base64String } from '../../../../../types/_common/common';
import type { ActionSummary } from '../../../../../types/_common/transactionDetails/actionSummaries';
import type {
  DeserializeTransactionActionSummariesArgs,
  DeserializeTransactionResultDataArgs,
} from '../../../../../types/_common/transactionDetails/transactionResult';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

const responseZodSchema = z.object({ decimals: z.number() });

const deserializeResultData = (args: { data: Base64String }) => responseZodSchema.parse(args.data);

type CustomDeserializeResult = (args: { rawResult: number[] }) => {
  decimals: number;
};

// Tests

const client = createTestnetClient();
const transactionHash = 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe';

const r10 = await client.getTransactionResult({
  transactionHash,
  options: {
    deserializeActionSummaries: (
      args: DeserializeTransactionActionSummariesArgs,
    ): [number, number, string] => [1, 2, '123'],
  },
});
const as = r10.processingSteps.conversionStep.transactionSummary.actionSummaries; //  [number, number, string]

// ***
const r11 = await client.getTransactionResult({
  transactionHash,
  options: {
    deserializeResultData: (_args: DeserializeTransactionResultDataArgs) => [1n, 'abc'],
  },
});

if (r11.result.status === 'Success') {
  const d = r11.result.data;
}

// ***
const r13 = await client.getTransactionResult({
  transactionHash,
  options: {
    deserializeActionSummaries: (args: DeserializeTransactionActionSummariesArgs) =>
      args.rawActionSummaries,
  },
});
const as13 = r13.processingSteps.conversionStep.transactionSummary.actionSummaries; //  ActionSummary[]

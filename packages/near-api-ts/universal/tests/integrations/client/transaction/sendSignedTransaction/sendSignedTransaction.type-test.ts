import { createTestnetClient } from '../../../../../src/client/presets/testnet';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

// Awaited output of safeSendSignedTransaction is Result<SendSignedTransactionOutput<TPS>, ...>;
// pull the `processingStage` union off the `ok: true` branch's `value`. Each extraction step
// distributes over a bare type parameter, so it correctly picks the `ok: true` member out of the
// Result union instead of requiring the whole union to match.
type ExtractOkValue<TResult> = TResult extends { ok: true; value: infer V } ? V : never;
type OkValue<TPromise> = ExtractOkValue<Awaited<TPromise>>;

type ExtractProcessingStage<TValue> = TValue extends { processingStage: infer S } ? S : never;
type ProcessingStageOf<TPromise> = ExtractProcessingStage<OkValue<TPromise>>;

const client = createTestnetClient();

const signedTransaction = {
  signedTransactionBorsh64: 'AA==',
  transactionHash: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe',
};

// const withDefault = client.safeSendSignedTransaction({ signedTransactionBorsh64 });
// type _DefaultStage = Assert<
//   Equal<
//     ProcessingStageOf<typeof withDefault>,
//     'ExecutedOptimistic' | 'ExecutedNearlyFinal' | 'CompletedFinal'
//   >
// >;
// Test minimalProcessingStage

const g10 = client.safeSendSignedTransaction({
  signedTransaction,
});

const g31 = client.safeSendSignedTransaction<undefined>({
  signedTransaction,
});

// @ts-expect-error
const g50 = client.safeSendSignedTransaction<number>({
  signedTransaction,
});

// # ConvertedOptimistic

const CO10 = client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'ConvertedOptimistic',
});

const CO11 = client.safeSendSignedTransaction<'ConvertedOptimistic'>({
  signedTransaction,
  minimalProcessingStage: 'ConvertedOptimistic',
});

const minimalProcessingStageCO11 =
  2 > 1 ? ('ConvertedFinal' as const) : ('ExecutedOptimistic' as const);

const CO21 = await client.safeSendSignedTransaction<'ConvertedFinal' | 'ExecutedOptimistic'>({
  signedTransaction,
  minimalProcessingStage: minimalProcessingStageCO11,
});

if (CO21.ok && CO21.value.processingStage) {
}

// ****

const CompletedFinal10 = await client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'CompletedFinal',
});
if (CompletedFinal10.ok && CompletedFinal10.value.data) {
}

const CompletedFinal20 = await client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'CompletedFinal',
  options: {
    deserializeResultData: () => 1,
  },
});
if (CompletedFinal20.ok && CompletedFinal20.value.data) {
}

// type _ConvertedOptimisticStage = Assert<
//   Equal<
//     ProcessingStageOf<typeof convertedOptimistic>,
//     | 'ConvertedOptimistic'
//     | 'ConvertedFinal'
//     | 'ExecutedOptimistic'
//     | 'ExecutedNearlyFinal'
//     | 'CompletedFinal'
//   >
// >;

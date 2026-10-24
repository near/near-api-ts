import type {
  GetTransactionResultDeserializeActionSummariesArgs,
  GetTransactionResultDeserializeExecutionStepsArgs,
  SendSignedTransactionDeserializeActionSummariesArgs,
  SendSignedTransactionDeserializeExecutionStepsArgs,
} from '../../../../index';
import type { constants } from '../../../../src/_common/_common/_common/constants';
import type { DeserializeActionSummariesFailedContext } from '../../../../types/client/methods/transaction/_common/innerErrorRegistry';
import type { ExecutionFailure } from '../../../../types/client/methods/transaction/_common/transactionDetails/executionFailure';
import type { ExecutionSuccess } from '../../../../types/client/methods/transaction/_common/transactionDetails/executionSuccess';
import type { GetTransactionResultOutput } from '../../../../types/client/methods/transaction/getTransactionResult';
import type {
  SendSignedTransactionError,
  SendSignedTransactionPublicErrorRegistry,
} from '../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { SendSignedTransactionOutput } from '../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { ExecuteTransactionPublicErrorRegistry } from '../../../../types/signer/public/createExecuteTransaction';

// The details of a transaction read back from the chain hold data of every protocol era, the
// details of a transaction sent now are `'Live'` - see `ProtocolEra`. `'Live'` details fit wherever
// details are read, while details of every era fit nowhere a sending method reports them - even
// before `'Legacy'` adds anything, since TS compares the two by the era alone.

declare const readSuccess: ExecutionSuccess<'Live' | 'Legacy'>['CompletedFinal'];
declare const sentSuccess: ExecutionSuccess<'Live'>['CompletedFinal'];
declare const readFailure: ExecutionFailure<'Live' | 'Legacy'>['ExecutedOptimistic'];
declare const sentFailure: ExecutionFailure<'Live'>['ExecutedOptimistic'];
declare const readSummariesFailure: DeserializeActionSummariesFailedContext<'Live' | 'Legacy'>;

// getTransactionResult
const _readOutput: GetTransactionResultOutput = readSuccess;
const _sentOutputAsRead: GetTransactionResultOutput = sentSuccess;

// sendSignedTransaction
const _sentOutput: SendSignedTransactionOutput<'CompletedFinal'> = sentSuccess;
// @ts-expect-error - details of every era do not fit the output of a sent transaction
const _readOutputAsSent: SendSignedTransactionOutput<'CompletedFinal'> = readSuccess;

type SentFailureDetails = Extract<
  SendSignedTransactionError,
  { kind: 'Client.SendSignedTransaction.Rpc.Executor.NotFound' }
>['context']['transactionDetails'];

const _sentFailure: SentFailureDetails = sentFailure;
// @ts-expect-error - nor its execution failure errors
const _readFailureAsSent: SentFailureDetails = readFailure;

type SentSummariesFailure =
  SendSignedTransactionPublicErrorRegistry['Client.SendSignedTransaction.DeserializeActionSummaries.Failed'];

// @ts-expect-error - nor the raw data a failed deserializer of it got
const _readSummariesFailureAsSent: SentSummariesFailure = readSummariesFailure;

// MemorySigner.executeTransaction
type SignedFailureDetails =
  ExecuteTransactionPublicErrorRegistry['MemorySigner.ExecuteTransaction.Rpc.Action.CreateSubAccount.AlreadyExists']['transactionDetails'];

const _signedFailure: SignedFailureDetails = sentFailure;
// @ts-expect-error - the same for a transaction a signer sends
const _readFailureAsSigned: SignedFailureDetails = readFailure;

// What `'Legacy'` adds, as each method reports it
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

type ActionType<S extends { actionType: string }> = S['actionType'];

type DelegatedActionType<S> = S extends {
  actionType: 'ExecuteDelegation';
  delegation: { delegatedActionSummaries: (infer D extends { actionType: string })[] };
}
  ? D['actionType']
  : never;

type Withdrawal<T extends string> = Extract<T, `${string}WithdrawAccessKeyBalance`>;

type ReadSummary = GetTransactionResultDeserializeActionSummariesArgs['rawActionSummaries'][number];
type SentSummary =
  SendSignedTransactionDeserializeActionSummariesArgs['rawActionSummaries'][number];

type ReadStepSummary =
  GetTransactionResultDeserializeExecutionStepsArgs['rawExecutionSteps'][number]['actionSummaries'][number];
type SentStepSummary =
  SendSignedTransactionDeserializeExecutionStepsArgs['rawExecutionSteps'][number]['actionSummaries'][number];

type SentParsedSummary =
  SendSignedTransactionOutput<'CompletedFinal'>['processingSteps']['conversionStep']['transactionSummary']['actionSummaries'][number];

// A withdrawal inside a delegation is legacy - getTransactionResult reports it as one, a sending
// method has none. A top-level withdrawal is live everywhere.
type _ReadDelegatedWithdrawal = Assert<
  Equal<Withdrawal<DelegatedActionType<ReadSummary>>, 'LegacyWithdrawAccessKeyBalance'>
>;
type _ReadStepDelegatedWithdrawal = Assert<
  Equal<Withdrawal<DelegatedActionType<ReadStepSummary>>, 'LegacyWithdrawAccessKeyBalance'>
>;
type _SentDelegatedWithdrawal = Assert<Equal<Withdrawal<DelegatedActionType<SentSummary>>, never>>;
type _SentStepDelegatedWithdrawal = Assert<
  Equal<Withdrawal<DelegatedActionType<SentStepSummary>>, never>
>;
type _SentParsedDelegatedWithdrawal = Assert<
  Equal<Withdrawal<DelegatedActionType<SentParsedSummary>>, never>
>;
type _ReadTopLevelWithdrawal = Assert<
  Equal<Withdrawal<ActionType<ReadSummary>>, 'WithdrawAccessKeyBalance'>
>;
type _SentTopLevelWithdrawal = Assert<
  Equal<Withdrawal<ActionType<SentSummary>>, 'WithdrawAccessKeyBalance'>
>;

// Every NEP-611 delegation is legacy - a sending method reports NEP-366 ones only
type Delegation<T extends string> = Extract<T, `${string}ExecuteDelegation`>;
type SentDelegation = Extract<SentSummary, { actionType: 'ExecuteDelegation' }>['delegation'];

type _ReadDelegations = Assert<
  Equal<Delegation<ActionType<ReadSummary>>, 'ExecuteDelegation' | 'LegacyExecuteDelegation'>
>;
type _ReadStepDelegations = Assert<
  Equal<Delegation<ActionType<ReadStepSummary>>, 'ExecuteDelegation' | 'LegacyExecuteDelegation'>
>;
type _SentDelegations = Assert<Equal<Delegation<ActionType<SentSummary>>, 'ExecuteDelegation'>>;
type _SentStepDelegations = Assert<
  Equal<Delegation<ActionType<SentStepSummary>>, 'ExecuteDelegation'>
>;
type _SentParsedDelegations = Assert<
  Equal<Delegation<ActionType<SentParsedSummary>>, 'ExecuteDelegation'>
>;
type _SentDelegationTag = Assert<
  Equal<SentDelegation['tag'], typeof constants.Delegation.Nep366Tag>
>;
type _SentDelegationScheme = Assert<
  Equal<SentDelegation['delegator']['replayProtection']['scheme'], 'NonceChannel'>
>;

// A deserializer for getTransactionResult must take what `'Legacy'` adds. One of a sending method
// takes `'Live'` data only, and one that takes more fits it too.
declare const sentDeserializer: (args: SendSignedTransactionDeserializeActionSummariesArgs) => 1;
declare const readDeserializer: (args: GetTransactionResultDeserializeActionSummariesArgs) => 1;

// @ts-expect-error - a deserializer of `'Live'` data does not fit getTransactionResult
const _sentDeserializerAsRead: typeof readDeserializer = sentDeserializer;
const _readDeserializerAsSent: typeof sentDeserializer = readDeserializer;

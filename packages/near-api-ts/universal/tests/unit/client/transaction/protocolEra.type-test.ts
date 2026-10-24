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

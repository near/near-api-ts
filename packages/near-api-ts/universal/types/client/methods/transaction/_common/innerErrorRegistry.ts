import type { Base64String, CryptoHash } from '../../../../_common/common';
import type { RawActionSummary } from '../../../../_common/transactionDetails/_common/_common/actionSummaries';
import type { RawExecutionStep } from '../../../../_common/transactionDetails/_common/executionStep';
import type { ExhaustedErrorContext } from '../../../transport/sendRequest';

// TODO figure out if we will reuse it at all - if not - remove
interface ExecutionFailureInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Rpc.Executor.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Executor.NotEnoughBalance': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Forbidden': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.AlreadyExists': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.TopLevelNamespace': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.ForeignNamespace': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.ImplicitAccount': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.AddKey.AlreadyExists': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Wasm.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Function.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Compilation.Failed': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Execution.Failed': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Stake.BelowThreshold': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Stake.NotEnoughBalance': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Stake.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.DeleteKey.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.DeleteAccount.Staking': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.DeleteAccount.LargeState': unknown;
}

export interface TransactionDetailsInnerErrorRegistry extends ExecutionFailureInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Exhausted': ExhaustedErrorContext;
  'Inner.Client.TransactionDetails.DeserializeResultData.Failed': {
    cause: unknown;
    rawData: Base64String;
  };
  'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed': {
    cause: unknown;
    rawActionSummaries: RawActionSummary[];
  };
  'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed': {
    cause: unknown;
    rawExecutionSteps: RawExecutionStep[];
  };
}

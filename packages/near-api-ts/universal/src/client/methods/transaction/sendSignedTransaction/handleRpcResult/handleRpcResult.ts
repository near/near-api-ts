import type { Result } from '../../../../../../types/_common/common';
import type { TransactionProcessingStage } from '../../../../../../types/_common/transactionDetails/processingStage';
import type { InnerSendSignedTransactionArgs } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/args';
import type { SendSignedTransactionError } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type {
  TransactionDetailsFromStageCompletedFinal,
  TransactionDetailsFromStageConvertedFinal,
  TransactionDetailsFromStageConvertedOptimistic,
  TransactionDetailsFromStageExecutedNearlyFinal,
  TransactionDetailsFromStageExecutedOptimistic,
} from '../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc/rpc';
import { getDetailsFromStageConvertedOptimistic } from './getDetailsFromStage/convertedOptimistic';

export const handleRpcResult = (
  rpcResponse: RpcResponse,
  minimalProcessingStage: TransactionProcessingStage,
  inputArgs: InnerSendSignedTransactionArgs,
): Result<
  | TransactionDetailsFromStageConvertedOptimistic<undefined, undefined, undefined>
  | TransactionDetailsFromStageConvertedFinal<undefined, undefined, undefined>
  | TransactionDetailsFromStageExecutedOptimistic<undefined, undefined, undefined>
  | TransactionDetailsFromStageExecutedNearlyFinal<undefined, undefined, undefined>
  | TransactionDetailsFromStageCompletedFinal<undefined, undefined, undefined>,
  SendSignedTransactionError
> => {
  if (minimalProcessingStage === 'ConvertedOptimistic')
    return getDetailsFromStageConvertedOptimistic(
      rpcResponse,
      inputArgs.signedTransaction.transactionHash,
      inputArgs.options?.deserializeActionSummaries,
    );

  throw new Error('Unexpected processing stage');
};

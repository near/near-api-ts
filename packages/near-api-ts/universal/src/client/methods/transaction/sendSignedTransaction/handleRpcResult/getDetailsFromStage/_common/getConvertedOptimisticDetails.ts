import type { ResultOk, TransactionHash } from '../../../../../../../../types/_common/common';
import type { TransactionDetailsAtStageConvertedOptimistic } from '../../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { result } from '../../../../../../../_common/utils/result';

export const getConvertedOptimisticDetails = (args: {
  transactionHash: TransactionHash;
}): ResultOk<TransactionDetailsAtStageConvertedOptimistic> =>
  result.ok({
    processingStage: 'ConvertedOptimistic' as const,
    transactionHash: args.transactionHash,
  });

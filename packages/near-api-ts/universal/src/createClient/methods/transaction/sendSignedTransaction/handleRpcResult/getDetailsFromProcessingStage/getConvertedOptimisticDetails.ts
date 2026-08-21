import type { TransactionHash } from '../../../../../../../types/_common/common';
import { getConversionSuccessConvertedOptimistic } from '../../../_common/getConversionSuccess';

export const getConvertedOptimisticDetails = (transactionHash: TransactionHash) =>
  getConversionSuccessConvertedOptimistic(transactionHash);

import type { Result, TransactionHash } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionSuccess } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/conversionSuccess';
import type { NatError } from '../../../../../../_common/_common/_common/_common/natError';
import { getConversionSuccessConvertedFinal } from '../../../_common/getConversionSuccess';
import type { RpcIncludedFinalTransactionDetails } from '../../../_common/zodSchemas/rpcTransactionDetails/rpcTransactionDetails';

export const getConvertedFinalDetails = (args: {
  rpcDetails: RpcIncludedFinalTransactionDetails;
  transactionHash: TransactionHash;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
}): Result<
  ConversionSuccess['ConvertedFinal'],
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> =>
  getConversionSuccessConvertedFinal({
    transaction: args.rpcDetails.transaction,
    transactionOutcomeSuccess: args.rpcDetails.transactionOutcome,
    deserializeActionSummaries: args.deserializeActionSummaries,
  });

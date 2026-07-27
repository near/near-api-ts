import type { Result, TransactionHash } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionSuccess } from '../../../../../../../types/_common/transactionDetails/conversionSuccess';
import type { NatError } from '../../../../../../_common/natError';
import type { RpcIncludedFinalTransactionDetails } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import { getConversionSuccessConvertedFinal } from '../../../_common/getConversionSuccess';

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

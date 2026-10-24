import type { Result } from '../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type { ConversionStepSuccess } from '../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/conversionStep';
import { type NatError } from '../../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../../_common/_common/_common/result';
import { gas } from '../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../_common/nearToken';
import type { RpcTransactionSummary } from '../zodSchemas/rpcTransactionDetails/rpcTransactionSummary';
import { getTransactionSummary } from './_common/getTransactionSummary';
import type { RpcTransactionOutcomeSuccess } from './zodSchemas/rpcTransactionOutcome';

type GetConversionStepSuccessArgs<PE extends ProtocolEra> = {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  protocolEras: PE[];
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn<PE>;
};

export const getConversionStepSuccess = <PE extends ProtocolEra>(
  args: GetConversionStepSuccessArgs<PE>,
): Result<
  ConversionStepSuccess<PE>,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const { transaction, transactionOutcomeSuccess, protocolEras, deserializeActionSummaries } = args;

  const transactionSummary = getTransactionSummary(
    transaction,
    protocolEras,
    deserializeActionSummaries,
  );
  if (!transactionSummary.success) return transactionSummary;

  return result.ok({
    result: {
      status: 'Success',
      firstExecutionStepId: transactionOutcomeSuccess.outcome.status.SuccessReceiptId.cryptoHash,
    },
    executedAt: { blockHash: transactionOutcomeSuccess.blockHash.cryptoHash },
    transactionSummary: transactionSummary.data,
    gasFee: yoctoNear(transactionOutcomeSuccess.outcome.tokensBurnt),
    gasUsed: gas(transactionOutcomeSuccess.outcome.gasBurnt),
  });
};

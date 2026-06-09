import type { ActionView } from '@near-js/jsonrpc-types';
import { gas, yoctoNear } from '../../../../../../../../index';
import type { Result } from '../../../../../../../../types/_common/common';
import type {
  ActionSummaries,
  ConversionStepError,
  ConversionStepSuccess,
  TransactionSummary,
} from '../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { MaybeBaseDeserializeTransactionActionSummariesFn } from '../../../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../../../types/client/methods/transaction/getTransactionResult';
import { type NatError, resultNatError } from '../../../../../../../_common/natError';
import type {
  RpcTransactionOutcomeFailure,
  RpcTransactionOutcomeSuccess,
} from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../../_common/utils/result';
import { baseGetActionSummary } from './_common/getActionSummaries';

export const getActionSummaries = <AS extends MaybeBaseDeserializeTransactionActionSummariesFn>(
  rawActionSummaries: ActionView[],
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  ActionSummaries<AS>,
  NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  // If a user wants to use his own custom deserializer:
  if (inputArgs.options?.deserializeActionSummaries) {
    try {
      return result.ok(
        inputArgs.options.deserializeActionSummaries({ rawActionSummaries }) as ActionSummaries<AS>,
      );
    } catch (cause) {
      return resultNatError('Client.GetTransactionResult.DeserializeActionSummaries.Failed', {
        cause,
        rawActionSummaries,
      });
    }
  }
  // If no custom deserializer is provided, use the default one and return default ActionSummaries
  // with unknown functionCall.functionArgs type
  return result.ok(rawActionSummaries.map(baseGetActionSummary) as ActionSummaries<AS>);
};

const getTransactionSummary = (
  transaction: RpcTransactionSummary,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionSummary,
  NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  const actionSummaries = getActionSummaries(transaction.actions, inputArgs);
  if (!actionSummaries.ok) return actionSummaries;

  return result.ok({
    signerAccountId: transaction.signerId,
    signerPublicKey: transaction.publicKey.publicKey,
    nonce: transaction.nonce,
    receiverAccountId: transaction.receiverId,
    actionSummaries: actionSummaries.value,
    signature: transaction.signature.signature,
  });
};

export const getConversionStepSuccess = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  ConversionStepSuccess,
  NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  const transactionSummary = getTransactionSummary(transaction, inputArgs);
  if (!transactionSummary.ok) return transactionSummary;

  return result.ok({
    result: {
      status: 'Success',
      firstExecutionStepId: transactionOutcome.outcome.status.SuccessReceiptId.cryptoHash,
    },
    executedAt: { blockHash: transactionOutcome.blockHash.cryptoHash },
    transactionSummary: transactionSummary.value,
    gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
    gasUsed: gas(transactionOutcome.outcome.gasBurnt),
  });
};

export const getConversionStepError = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeFailure,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  ConversionStepError,
  NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  const transactionSummary = getTransactionSummary(transaction, inputArgs);
  if (!transactionSummary.ok) return transactionSummary;

  return result.ok({
    result: {
      status: 'Error',
      error: {
        kind: 'error',
        context: 'any',
      },
    },
    executedAt: {
      blockHash: transactionOutcome.blockHash.cryptoHash,
    },
    transactionSummary: transactionSummary.value,
    gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
    gasUsed: gas(transactionOutcome.outcome.gasBurnt),
  });
};

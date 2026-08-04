import type { InvalidTxError } from '@near-js/jsonrpc-types';
import type { ConversionFailureError } from '../../../../../../types/_common/transactionDetails/_common/_common/conversionFailureError';
import { yoctoNear } from '../../../../../helpers/tokens/nearToken';

const formErrorObject = <K, C>(kind: K, context: C) => ({ kind, context });

export const getConversionFailureError = (
  invalidTxError: InvalidTxError,
): ConversionFailureError => {
  if (invalidTxError === 'InvalidSignature') return formErrorObject('Signature.Invalid', null);
  if (invalidTxError === 'Expired') return formErrorObject('Expired', null);

  if (typeof invalidTxError === 'object') {
    if ('InvalidNonce' in invalidTxError)
      return formErrorObject('Nonce.Invalid', {
        transactionNonce: invalidTxError.InvalidNonce.txNonce,
        accessKeyNonce: invalidTxError.InvalidNonce.akNonce,
      });

    if ('SignerDoesNotExist' in invalidTxError)
      return formErrorObject('Signer.NotFound', {
        signerAccountId: invalidTxError.SignerDoesNotExist.signerId,
      });

    if ('NotEnoughBalance' in invalidTxError)
      return formErrorObject('TransactionCost.NotCovered', {
        signerAccountId: invalidTxError.NotEnoughBalance.signerId,
        transactionCost: yoctoNear(invalidTxError.NotEnoughBalance.cost),
        // What the balance was short of the cost the node quoted. The cost of the next attempt
        // depends on the gas price of its block, so this is only the minimal top up.
        minimalMissingAmount: yoctoNear(invalidTxError.NotEnoughBalance.cost).sub(
          yoctoNear(invalidTxError.NotEnoughBalance.balance),
        ),
      });

    if ('LackBalanceForState' in invalidTxError)
      return formErrorObject('Signer.StorageUsage.NotCovered', {
        signerAccountId: invalidTxError.LackBalanceForState.signerId,
        missingAmount: yoctoNear(invalidTxError.LackBalanceForState.amount),
      });
  }

  throw new Error(`Unexpected invalidTxError: ${JSON.stringify(invalidTxError)}`);
};

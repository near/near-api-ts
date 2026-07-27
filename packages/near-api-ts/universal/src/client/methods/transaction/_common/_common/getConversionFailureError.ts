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
      return formErrorObject('Signer.NotEnoughBalance', {
        transactionCost: yoctoNear(invalidTxError.NotEnoughBalance.cost),
        signerAccountId: invalidTxError.NotEnoughBalance.signerId,
      });

    // if ('LackBalanceForState' in invalidTxError)
    //   return formErrorObject('Signer.NotEnoughBalance', {
    //     // transactionCost: yoctoNear(invalidTxError.LackBalanceForState.amount),
    //     signerAccountId: invalidTxError.LackBalanceForState.signerId,
    //   });

    // if ('' in invalidTxError)
    //   return formErrorObject('Signer.NotEnoughBalance', {
    //     transactionCost: yoctoNear(invalidTxError.NotEnoughBalance.cost),
    //     signerAccountId: invalidTxError.NotEnoughBalance.signerId,
    //   });
  }

  throw new Error(`Unexpected invalidTxError: ${JSON.stringify(invalidTxError)}`);
};

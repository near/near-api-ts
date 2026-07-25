import type { InvalidTxError } from '@near-js/jsonrpc-types';
import type { ConversionFailureError } from '../../../../../../../types/_common/transactionDetails/_common/_common/conversionFailureError';

// Right now we aren't sure if it's really possible to meet a conversion error on the chain,
// and which union options are real, so we return the error as is
export const getConversionFailureError = (invalidTxError: InvalidTxError): ConversionFailureError =>
  invalidTxError as any;

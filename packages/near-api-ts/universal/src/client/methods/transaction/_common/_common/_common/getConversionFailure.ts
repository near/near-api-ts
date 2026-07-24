import type { InvalidTxError } from '@near-js/jsonrpc-types';

// Right now we aren't sure if it's really possible to meet a conversion error on the chain,
// and which union options are real, so we return the error as is
export const getConversionFailure = (invalidTxError: InvalidTxError): unknown => invalidTxError;

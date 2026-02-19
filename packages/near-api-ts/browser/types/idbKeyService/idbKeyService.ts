import type { InternalErrorContext, InvalidSchemaErrorContext } from '@universal/types/natError';

export interface IdbKeyServicePublicErrorRegister {
  'CreateIdbKeyService.Internal': InternalErrorContext;
  'IdbKeyService.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'IdbKeyService.SignTransaction.Internal': InternalErrorContext;
}

import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '@universal/types/natError';

export interface FileKeyServicePublicErrorRegister {
  'CreateFileKeyService.Internal': InternalErrorContext;
  'FileKeyService.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'FileKeyService.SignTransaction.Internal': InternalErrorContext;
}

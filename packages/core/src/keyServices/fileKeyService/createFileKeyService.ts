import * as z from 'zod/mini';
import { createSafeSignTransaction } from './createSignTransaction';
import { getKeyPairs } from './getKeyPairs';
import { createSafeFindKeyPair } from './createFindKeyPair';
import { asThrowable } from '@common/utils/asThrowable';
import { result } from '@common/utils/result';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { PrivateKeySchema } from '@common/schemas/zod/common/privateKey';
import { createNatError } from '@common/natError';
import type {
  FileKeyService,
  FileKeyServiceContext,
} from 'nat-types/keyServices/fileKeyService/fileKeyService';
import type {
  CreateFileKeyService,
  SafeCreateFileKeyService,
} from 'nat-types/keyServices/fileKeyService/createFileKeyService';

export const FileKeyServiceBrand = Symbol('FileKeyService');

export const isFileKeyService = (value: unknown): value is FileKeyService =>
  typeof value === 'object' && value !== null && FileKeyServiceBrand in value;

const KeySourceSchema = z.object({
  privateKey: PrivateKeySchema,
});

const CreateFileKeyServiceArgsSchema = z.union([
  z.object({
    keySource: KeySourceSchema,
  }),
  z.object({
    keySources: z.array(KeySourceSchema).check(z.minLength(1)),
  }),
]);

export type InnerCreateMemoryKeyServiceArgs = z.infer<
  typeof CreateFileKeyServiceArgsSchema
>;

export const safeCreateFileKeyService: SafeCreateFileKeyService =
  wrapInternalError('CreateFileKeyService.Internal', (args) => {
    const validArgs = CreateFileKeyServiceArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateFileKeyService.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const context = {
      keyPairs: getKeyPairs(validArgs.data),
    } as FileKeyServiceContext;

    const safeFindKeyPair = createSafeFindKeyPair(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    context.safeFindKeyPair = safeFindKeyPair;

    return result.ok({
      [FileKeyServiceBrand]: true as const,
      signTransaction: asThrowable(safeSignTransaction),
      safeSignTransaction,
      findKeyPair: asThrowable(safeFindKeyPair),
      safeFindKeyPair,
    });
  });

export const throwableCreateFileKeyService: CreateFileKeyService = asThrowable(
  safeCreateFileKeyService,
);

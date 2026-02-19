import { asThrowable } from '@universal/src/_common/utils/asThrowable';
import { result } from '@universal/src/_common/utils/result';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import path from 'node:path';
import process from 'node:process';
import * as z from 'zod/mini';
import { createGetKeyPair } from './private/getKeyPair';
import { createSafeAddKeyPair } from './public/addKeyPair';
import { createSafeClear } from './public/clear';
import { createHasKeyPair } from './public/hasKeyPair';
import { createSafeRemoveKeyPair } from './public/removeKeyPair';
import { createSafeSignTransaction } from './public/signTransaction';

// const KeySourceSchema = z.object({
//   privateKey: PrivateKeySchema,
// });
//
const CreateFileKeyServiceArgsSchema = z.optional(
  z.object({
    path: z.optional(z.string().check(z.minLength(1))),
  }),
);

export type InnerCreateFileKeyServiceArgs = z.infer<
  typeof CreateFileKeyServiceArgsSchema
>;

export const safeCreateFileKeyService: any = wrapInternalError(
  'CreateFileKeyService.Internal',
  (args: any) => {
    // const validArgs = CreateFileKeyServiceArgsSchema.safeParse(args);
    //
    // if (!validArgs.success)
    //   return result.err(
    //     createNatError({
    //       kind: 'CreateFileKeyService.Args.InvalidSchema',
    //       context: { zodError: validArgs.error },
    //     }),
    //   );

    const rootDirPath = path.resolve(
      process.cwd(),
      args?.path ?? '.near-api-ts:key-vault',
    );

    const context = {
      rootDirPath,
      keyPairs: new Map(),
    } as any;

    context.getKeyPair = createGetKeyPair(context);

    const safeAddKeyPair = createSafeAddKeyPair(context);
    const safeHasKeyPair = createHasKeyPair(context);
    const safeRemoveKeyPair = createSafeRemoveKeyPair(context);
    const safeClear = createSafeClear(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    return result.ok({
      addKeyPair: asThrowable(safeAddKeyPair),
      hasKeyPair: asThrowable(safeHasKeyPair),
      removeKeyPair: asThrowable(safeRemoveKeyPair),
      clear: asThrowable(safeClear),
      signTransaction: asThrowable(safeSignTransaction),
      safeAddKeyPair,
      safeHasKeyPair,
      safeRemoveKeyPair,
      safeClear,
      safeSignTransaction,
    });
  },
);

export const throwableCreateFileKeyService: any = asThrowable(
  safeCreateFileKeyService,
);

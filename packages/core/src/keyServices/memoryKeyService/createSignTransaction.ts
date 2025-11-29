import { getTransactionHash } from '../../helpers/getTransactionHash';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type {
  MemoryKeyServiceContext,
  SafeSignTransaction,
} from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { createNatError } from '@common/natError';

export const createSafeSignTransaction = (
  context: MemoryKeyServiceContext,
): SafeSignTransaction =>
  wrapUnknownError('MemoryKeyService.SignTransaction.Unknown', async (args) => {
    // TODO Implement args validation

    const keyPair = context.safeFindKeyPair({
      publicKey: args.transaction.signerPublicKey,
    });

    // TODO Think if it's possible to wrap into some helper function
    if (!keyPair.ok) {
      if (keyPair.error.kind === 'MemoryKeyService.FindKeyPair.NotFound')
        return result.err(
          createNatError({
            kind: 'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound',
            context: { signerPublicKey: args.transaction.signerPublicKey },
          }),
        );
      throw keyPair.error;
    }

    const { transactionHash, u8TransactionHash } = getTransactionHash(
      args.transaction,
    );
    const { signature } = keyPair.value.sign(u8TransactionHash);

    return result.ok({
      transaction: args.transaction,
      transactionHash,
      signature,
    });
  });

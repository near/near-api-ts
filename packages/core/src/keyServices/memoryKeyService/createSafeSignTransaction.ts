import { getTransactionHash } from '../../helpers/crypto/getTransactionHash';
import { sign } from '../../helpers/crypto/sign';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type {
  Context,
  SafeSignTransaction,
} from 'nat-types/keyServices/memoryKeyService';

export const createSafeSignTransaction = (
  context: Context,
): SafeSignTransaction =>
  wrapUnknownError(async (args) => {
    // TODO Implement args validation

    const privateKey = context.safeFindPrivateKey({
      publicKey: args.transaction.signerPublicKey,
    });
    if (!privateKey.ok) return privateKey;

    const { transactionHash, u8TransactionHash } = getTransactionHash(
      args.transaction,
    );

    const { signature } = sign({
      message: u8TransactionHash,
      privateKey: privateKey.value,
    });

    return result.ok({
      transaction: args.transaction,
      transactionHash,
      signature,
    });
  });

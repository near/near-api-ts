import {
  AccountIdSchema,
  Base64StringSchema,
  PublicKeySchema,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from 'near-api-ts';
import * as z from 'zod/mini';
import type { CreateSafeSignMessage } from '../../../types/services/nearConnect.ts';
import { result } from '../../_common/utils/result.ts';

const NearConnectSignedMessageSchema = z.object({
  accountId: AccountIdSchema,
  publicKey: PublicKeySchema,
  signature: Base64StringSchema,
});

export const createSafeSignMessage: CreateSafeSignMessage = (connector) => async (args) => {
  // TODO Validate args
  try {
    const wallet = await connector.wallet();
    const { message, recipient, nonce } = args.message;

    // We can't be 100% sure that wallets return the valid response;
    // So we will validate it ourselves;
    const nearConnectSignedMessage: unknown = await wallet.signMessage({
      message: message,
      recipient: recipient,
      nonce: Uint8Array.fromBase64(nonce),
    });

    // Validate + transform wallet response
    const validNearConnectSignedMessage =
      NearConnectSignedMessageSchema.parse(nearConnectSignedMessage);

    const { publicKey, curve } = validNearConnectSignedMessage.publicKey;

    // TODO Use createNep413MessageSignatureSchema
    const u8Signature = Uint8Array.fromBase64(validNearConnectSignedMessage.signature);

    const base58Signature =
      curve === 'ed25519' ? toEd25519CurveString(u8Signature) : toSecp256k1CurveString(u8Signature);

    return result.ok({
      signerAccountId: validNearConnectSignedMessage.accountId,
      signerPublicKey: publicKey,
      message: args.message,
      signature: base58Signature,
    });
  } catch (e) {
    return result.err(e);
  }
};

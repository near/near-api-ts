import {
  AccountIdZodSchema,
  Base64StringZodSchema,
  PublicKeyZodSchema,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from 'near-api-ts';
import * as z from 'zod/mini';
import type {
  CreateCanSignMessage,
  CreateSafeSignMessage,
} from '../../../../types/services/nearConnector.ts';
import { result } from '../../../_common/utils/result.ts';

const NearConnectSignedMessageSchema = z.object({
  accountId: AccountIdZodSchema,
  publicKey: PublicKeyZodSchema,
  signature: Base64StringZodSchema,
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
    const signatureU8 = Uint8Array.fromBase64(validNearConnectSignedMessage.signature);

    const base58Signature =
      curve === 'ed25519' ? toEd25519CurveString(signatureU8) : toSecp256k1CurveString(signatureU8);

    /// todo Return messageBorsh64 + add tag to Message
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

// We assume that if the wallet declares that it supports signMessage, then it supports signMessage;
export const createCanSignMessage: CreateCanSignMessage = (connector) => (_args) =>
  connector.features.signMessage === true;

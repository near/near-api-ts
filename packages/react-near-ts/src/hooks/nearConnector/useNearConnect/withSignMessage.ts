import type {
  EventMap,
  SignedMessage as NearConnectSignedMessage,
} from '@hot-labs/near-connect/build/types';
import { useMutation } from '@tanstack/react-query';
import {
  AccountIdSchema,
  Base64StringSchema,
  type Curve,
  constants,
  type Message,
  PublicKeySchema,
  type SignedMessage,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from 'near-api-ts';
import * as z from 'zod/mini';
import type { InnerUseNearConnectArgs } from '../../../../types/hooks/nearConnector/useNearConnect/useNearConnect.ts';
import type {
  Variables,
  WithSignMessageOutput,
} from '../../../../types/hooks/nearConnector/useNearConnect/withSignMessage.ts';
import type { SetConnectedAccountId, SetSigners, StoreContext } from '../../../../types/store.ts';
import { NearConnectorServiceSchema } from '../_common.ts';

export const createNep413MessageSignatureSchema = (curve: Curve) =>
  z
    .pipe(
      Base64StringSchema,
      z.transform((base64Signature) => ({
        u8Signature: Uint8Array.fromBase64(base64Signature),
      })),
    )
    .check(
      z.refine(
        ({ u8Signature }) =>
          curve === 'ed25519'
            ? u8Signature.length === constants.BinaryLengths.Ed25519.Signature
            : u8Signature.length === constants.BinaryLengths.Secp256k1.Signature,
        { error: 'Invalid signature length' },
      ),
    );

// We need to transform the signed message from @hot-labs/near-connect to near-api-ts format
const transformSignedMessage = (
  signedMessage: NearConnectSignedMessage,
  message: Message,
): SignedMessage => {
  const signerAccountId = AccountIdSchema.parse(signedMessage?.accountId);
  const signerPublicKey = PublicKeySchema.parse(signedMessage?.publicKey);

  const { u8Signature } = createNep413MessageSignatureSchema(signerPublicKey.curve).parse(
    signedMessage?.signature,
  );

  const signature =
    signerPublicKey.curve === 'ed25519'
      ? toEd25519CurveString(u8Signature)
      : toSecp256k1CurveString(u8Signature);

  return {
    signerAccountId,
    signerPublicKey: signerPublicKey.publicKey,
    message,
    signature: signature,
  };
};

export const withSignMessage = (
  args: InnerUseNearConnectArgs,
  context: StoreContext,
  setSigners: SetSigners,
  setConnectedAccountId: SetConnectedAccountId,
): WithSignMessageOutput<unknown> => {
  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async (variables: Variables) => {
      const services = NearConnectorServiceSchema.parse(context.services);
      const connector = services.nearConnector.serviceBox.connector;

      let callback!: (event: EventMap['wallet:signInAndSignMessage']) => void;

      try {
        const promise: Promise<NearConnectSignedMessage> = new Promise((resolve) => {
          callback = (event) => {
            resolve(event.accounts[0]?.signedMessage);
          };
          connector.on('wallet:signInAndSignMessage', callback);
        });

        await connector.connect({
          signMessageParams: {
            message: variables.message.message,
            recipient: variables.message.recipient,
            nonce: Uint8Array.fromBase64(variables.message.nonce),
          },
        });

        const nearConnectSignedMessage = await promise;
        const signedMessage = transformSignedMessage(nearConnectSignedMessage, variables.message);

        setSigners(signedMessage.signerAccountId);
        setConnectedAccountId(signedMessage.signerAccountId);

        return signedMessage;
      } catch (e) {
        throw e;
      } finally {
        connector.off('wallet:signInAndSignMessage', callback);
      }
    },
  });

  return {
    ...rest,
    connect: (args) => mutate(args, args?.mutate),
    connectAsync: (args) => mutateAsync(args, args?.mutate),
  };
};

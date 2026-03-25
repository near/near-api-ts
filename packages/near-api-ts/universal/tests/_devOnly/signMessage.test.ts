import { sha256 } from '@noble/hashes/sha2';
import { describe, it } from 'vitest';
import { createTestnetClient, keyPair } from '../../index';
import { toBorshNep413Message } from '../../src/_common/transformers/toBorshBytes/message';
import { createMessage } from '../../src/helpers/message/createMessage';
import { verifyMessage } from '../../src/helpers/message/verifyMessage';
import type { Message, SignedMessage } from '../../types/_common/message';

const signMessage = async (args: { message: Message }): Promise<SignedMessage> => {
  const kp = keyPair(
    'secp256k1:2AA1S7ExeLZWJPd6CuBD37vFtkbyAXdkmHbXd7CVzm3A4VZhzEBenkGr9nJkn2Dhcf5QEkdoDwH1DbQ6V8iEPsDwbheqhiHS7G467xQugVyscLvrAmyFJDfZY5QkRErwxxQ6',
  );
  const signerAccountId = 'eclipseer.testnet';

  const borshNep413Message = toBorshNep413Message(args.message);
  const u8MessageHash = sha256(borshNep413Message);
  const { signature } = kp.sign(u8MessageHash); // keyService.sign will be async

  return {
    signerAccountId,
    signerPublicKey: kp.publicKey,
    message: args.message,
    signature,
  };
};

describe('Sign Message - Ok', () => {
  it('Sign', async () => {
    // #1
    const message = createMessage({
      message: 'Login',
      recipient: 'abc',
      nonce: new Uint8Array(32).fill(0),
    });

    // #2
    const signedMessage = await signMessage({ message });
    console.log(signedMessage);

    // #3
    const isValid = await verifyMessage({
      signedMessage,
      message,
      client: createTestnetClient(),
    });
    console.log('isValid', isValid);
  });
});

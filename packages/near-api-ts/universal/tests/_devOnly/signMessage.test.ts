import { describe, it } from 'vitest';
import { createTestnetClient } from '@universal/index';
import { keyPair } from '@universal/index';
import { sha256 } from '@noble/hashes/sha2';
import { createMessage } from '@universal/src/helpers/message/createMessage';
import type { Message, SignedMessage } from '@universal/types/_common/message';
import { toBorshNep413Message } from '@universal/src/_common/transformers/toBorshBytes/message';
import { verifyMessage } from '@universal/src/helpers/message/verifyMessage';

const signMessage = async (args: { message: Message }): Promise<SignedMessage> => {
  const kp = keyPair(
    'ed25519:5sAGQFD878c7MRoy9ACfgtTzejubjm76FPxUQpBPqUG26H9XMayZn36244vwkTuxrYFcFBE4YMXNcna1jXC6RxqU',
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
      data: 'Login',
      requester: 'abc',
      nonce: new Uint8Array(32).fill(0),
    });

    // #2
    const signedMessage = await signMessage({ message });
    console.log(signedMessage);

    // #3
    const isValid = await verifyMessage({
      signedMessage,
      originMessage: message,
      client: createTestnetClient(),
    });
    console.log('isValid', isValid);
  });
});

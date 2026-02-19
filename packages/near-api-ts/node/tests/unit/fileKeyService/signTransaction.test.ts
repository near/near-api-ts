import { randomEd25519KeyPair, transfer } from '@universal/index';
import { log } from '@universal/tests/utils/common';
import { throwableCreateFileKeyService } from 'node/src/fileKeyService/fileKeyService';
import { it } from 'vitest';

it('FileKeyService:Sign transaction', async () => {
  try {
    const kp1 = randomEd25519KeyPair();
    const keyService = throwableCreateFileKeyService();

    await keyService.addKeyPair(kp1);

    const tx = await keyService.safeSignTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: kp1.publicKey,
        nonce: 1,
        blockHash: 'UQcU8hMLAG96mBFEW8rwn5hj1icKbgVUE4G3QKUB5gy',
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: '123.nat',
      },
    });
    log(tx);

    await keyService.removeKeyPair(kp1);

    // expect(result.publicKey).toBe(kp1.publicKey);
  } catch (e) {
    log(e);
  }

});

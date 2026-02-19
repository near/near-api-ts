import { randomEd25519KeyPair } from '@universal/index';
import { log } from '@universal/tests/utils/common';

import { throwableCreateFileKeyService } from 'node/src/fileKeyService/fileKeyService';
import { describe, it, vi } from 'vitest';

vi.setConfig({ testTimeout: 60000 });

describe('FileKeyService.', () => {
  it('Add key', async () => {
    try {
      const kp1 = randomEd25519KeyPair();
      const kp2 = randomEd25519KeyPair();
      const keyService = throwableCreateFileKeyService();

      const r1 = await keyService.addKey(kp1);
      console.log(r1);
      const r2 = await keyService.addKey(kp2);
      console.log(r2);
      await keyService.removeKey(kp2);
    } catch (e) {
      log(e);
    }

    // expect(result.publicKey).toBe(kp1.publicKey);
  });

  // it('MemoryKeyService.SignTransaction.SigningKeyPair.NotFound', async () => {
  //   const keyService = createMemoryKeyService({
  //     keySource: { privateKey: randomEd25519KeyPair().privateKey },
  //   });
  //
  //   const res = keyService.safeFindKeyPair({
  //     publicKey: randomEd25519KeyPair().publicKey,
  //   });
  //   assertNatErrKind(res, 'MemoryKeyService.FindKeyPair.NotFound');
  // });
});

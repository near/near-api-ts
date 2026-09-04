import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../index';
import type { KeyPair } from '../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../../utils/testKeys';
import { delegatedLinkGlobalContract } from './delegatedLinkGlobalContract';
import { delegatedPinGlobalContract } from './delegatedPinGlobalContract';

export type TestContext = {
  client: Client;
  /** The genesis key `nat`, `alice` and `bob` all share. */
  defaultKeyPair: KeyPair;
  /** The key of `relay`, the account that pays for and sends every delegation here. */
  relayKeyPair: KeyPair;
};

describe('signAndSendTransaction › delegation › success', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
    relayKeyPair: keyPair(testKeys.a.privateKey),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('links code registered under an account id', delegatedLinkGlobalContract(context));
  it('pins code registered under its wasm hash', delegatedPinGlobalContract(context));
});

import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { type Client } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { createDefaultClient } from '../../../utils/common';

vi.setConfig({ testTimeout: 60000 });

describe('CallContractReadFunction', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok', async () => {

  });

  it('Invalid args', async () => {

    //assertNatErrKind(res, 'Client.GetAccountAccessKey.Args.InvalidSchema');
  });
});

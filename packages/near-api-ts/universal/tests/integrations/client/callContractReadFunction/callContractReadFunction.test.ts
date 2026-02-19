import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import {
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  deployContract,
  functionCall,
  near,
  transfer,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { createDefaultClient, getFileBytes } from '../../../utils/common';
import { toJsonBytes } from '../../../../src/_common/utils/common';

vi.setConfig({ testTimeout: 60000 });

describe('CallContractReadFunction', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    const keyService = createMemoryKeyService({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });
    const nat = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          transfer({ amount: near('50') }),
          deployContract({
            wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
          }),
          functionCall({
            functionName: 'write_record',
            functionArgs: {
              record_id: 0,
              record: 'Hello',
            },
            gasLimit: { teraGas: '100' },
          }),
        ],
        receiverAccountId: 'c.nat',
      },
    });

    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const res = await client.callContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      functionArgs: { record_id: 0 },
    });
    expect(res.result).toBe('Hello');
  });

  it('Ok + custom serializeArgs', async () => {
    const res = await client.callContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      functionArgs: { recordId: 0 },
      options: {
        serializeArgs: (args) =>
          toJsonBytes({ record_id: args.functionArgs.recordId }),
      },
    });
    expect(res.result).toBe('Hello');
  });

  it('Rpc.Execution.Failed - missed field in functionArgs', async () => {
    const res = await client.safeCallContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      functionArgs: { record: 1 },
    });
    assertNatErrKind(
      res,
      'Client.CallContractReadFunction.Rpc.Execution.Failed',
    );
  });

  it('Args.InvalidSchema - invalid json args', async () => {
    // @ts-expect-error
    const res = await client.safeCallContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      functionArgs: { record: 1n },
    });
    assertNatErrKind(res, 'Client.CallContractReadFunction.Args.InvalidSchema');
  });

  it('CustomSerializer.InvalidOutput', async () => {
    // @ts-expect-error
    const res = await client.safeCallContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      options: {
        serializeArgs: () => 1,
      },
    });
    assertNatErrKind(
      res,
      'Client.CallContractReadFunction.SerializeArgs.InvalidOutput',
    );
  });

  it('CustomSerializer.Internal', async () => {
    const res = await client.safeCallContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      functionArgs: { record: 1n },
      options: {
        serializeArgs: () => {
          throw new Error('Internal');
        },
      },
    });
    assertNatErrKind(
      res,
      'Client.CallContractReadFunction.SerializeArgs.Internal',
    );
  });

  it('DeserializeResult.Internal', async () => {
    const res = await client.safeCallContractReadFunction({
      contractAccountId: 'c.nat',
      functionName: 'get_record',
      functionArgs: { record_id: 0 },
      options: {
        deserializeResult: () => {
          throw new Error('Internal');
        },
      },
    });
    assertNatErrKind(
      res,
      'Client.CallContractReadFunction.DeserializeResult.Internal',
    );
  });
});

import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { accessKeyNotFound } from './accessKeyNotFound';
import { depositWithFunctionCall } from './depositWithFunctionCall';
import { methodNameMismatch } from './methodNameMismatch';
import { notEnoughAllowance } from './notEnoughAllowance';
import { receiverMismatch } from './receiverMismatch';
import { requiresFullAccess } from './requiresFullAccess';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › InvalidAccessKey.* conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with AccessKey.NotFound when the signer public key is not attached to the account',
    accessKeyNotFound(context),
  );

  it(
    'fails with AccessKey.ReceiverMismatch when the receiver is not the key contract',
    receiverMismatch(context),
  );

  it(
    'fails with AccessKey.MethodNameMismatch when the function is not allowed by the key',
    methodNameMismatch(context),
  );

  it(
    'fails with AccessKey.RequiresFullAccess when the action is not a function call',
    requiresFullAccess(context),
  );

  it(
    'fails with AccessKey.DepositWithFunctionCall when the function call carries a deposit',
    depositWithFunctionCall(context),
  );

  it(
    'fails with AccessKey.NotEnoughAllowance when the gas budget is below the transaction cost',
    notEnoughAllowance(context),
  );
});

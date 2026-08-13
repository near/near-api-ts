import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

const GAS_BUDGET_YOCTO_NEAR = 1n;

export const gasBudgetNotEnough = (context: TestContext) => async () => {
  const { client } = context;

  // The key passes every permission check but its gas budget can't cover even the
  // cheapest transaction, so the node fails while charging the allowance.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    contractAccountId: 'alice',
    gasBudget: { yoctoNear: GAS_BUDGET_YOCTO_NEAR },
    allowedFunctions: 'AllNonPayable',
  });

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: functionCallKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: functionCallKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: functionCallKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: functionCall({
        functionName: 'any_function',
        gasLimit: { teraGas: '10' },
      }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.GasBudget.NotEnough');

  const { info } = tx.error.context;
  expect(info.signerAccountId).toBe('nat');
  expect(info.signerPublicKey).toBe(functionCallKeyPair.publicKey);
  expect(info.gasBudget.yoctoNear).toBe(GAS_BUDGET_YOCTO_NEAR);
  // The transaction cost depends on the current gas price, so only its shape is checked.
  expect(info.transactionCost.yoctoNear).toBeGreaterThan(info.gasBudget.yoctoNear);
};

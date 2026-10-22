import { expect } from 'vitest';
import { callContractFunction } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../signer.test';
import { attachContractFunctionCallKey } from './_common/attachContractFunctionCallKey';

const GAS_BUDGET_YOCTO_NEAR = 1n;

export const gasBudgetNotEnough = (context: TestContext) => async () => {
  const { client } = context;

  // The key passes every permission check but its gas budget can't cover even the
  // cheapest transaction, so the node fails while charging the allowance.
  const contractFunctionCallKeyPair = await attachContractFunctionCallKey(context, {
    allowedContract: 'alice',
    allowance: { yoctoNear: GAS_BUDGET_YOCTO_NEAR },
    allowedFunctions: 'AllNonPayable',
  });

  const contractFunctionCallAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: contractFunctionCallKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: contractFunctionCallKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: contractFunctionCallKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(contractFunctionCallAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: contractFunctionCallAccessKey.atMomentOf.blockHash,
      action: callContractFunction({
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
  expect(info.signerPublicKey).toBe(contractFunctionCallKeyPair.publicKey);
  expect(info.gasBudget.yoctoNear).toBe(GAS_BUDGET_YOCTO_NEAR);
  // The transaction cost depends on the current gas price, so only its shape is checked.
  expect(info.transactionCost.yoctoNear).toBeGreaterThan(info.gasBudget.yoctoNear);
};

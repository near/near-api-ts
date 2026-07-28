import { expect } from 'vitest';
import { functionCall } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';
import type { TestContext } from './invalidAccessKey.test';

export const notEnoughAllowance = (context: TestContext) => async () => {
  const { client } = context;

  // The key passes every permission check but its gas budget can't cover even the
  // cheapest transaction, so the node fails while charging the allowance.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    contractAccountId: 'alice',
    gasBudget: { yoctoNear: '1' },
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
      action: functionCall({ functionName: 'any_function', gasLimit: { teraGas: '10' } }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    InvalidAccessKeyError: {
      NotEnoughAllowance: {
        accountId: 'nat',
        publicKey: functionCallKeyPair.publicKey,
        allowance: '1',
        // The transaction cost depends on the current gas price, so only its shape is checked.
        cost: expect.any(String),
      },
    },
  });
};

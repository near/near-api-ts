import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../actions.test';

// Gas is a u64 on the wire, so the largest value a single action can carry.
const MAX_GAS = 2n ** 64n - 1n;

export const totalGasLimitOverflow = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      // Each action on its own is valid — it is `total_prepaid_gas` summing them with
      // `checked_add` that overflows, which is the only way to reach this variant. The sum
      // never gets compared against the limit, so this hides `TotalGasLimit.Exceeded`.
      actions: [
        functionCall({ functionName: 'any_function', gasLimit: { gas: MAX_GAS } }),
        functionCall({ functionName: 'any_function', gasLimit: { gas: MAX_GAS } }),
      ],
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Actions.FunctionCall.TotalGasLimit.Overflow',
  );
  expect(tx.error.context.info).toBe(null);
};

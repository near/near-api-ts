import { expect } from 'vitest';
import { functionCall, teraGas } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../actions.test';

// `max_total_prepaid_gas` from the runtime config — raised from 300 to 1000 TGas in protocol
// version 83 (`core/parameters/res/runtime_configs/83.yaml`).
const MAX_TOTAL_GAS_LIMIT = teraGas('1000');
const TOTAL_GAS_LIMIT = MAX_TOTAL_GAS_LIMIT.add({ teraGas: '1' });

export const totalGasLimitExceeded = (context: TestContext) => async () => {
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
      // The gas of every action is summed up, so a single call over the limit is enough —
      // the check is the last one `validate_actions_with_mode` performs.
      action: functionCall({
        functionName: 'any_function',
        gasLimit: { teraGas: TOTAL_GAS_LIMIT.teraGas },
      }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Actions.FunctionCall.TotalGasLimit.Exceeded',
  );

  const { info } = tx.error.context;
  expect(info.totalGasLimit.teraGas).toBe(TOTAL_GAS_LIMIT.teraGas);
  expect(info.maximumTotalGasLimit.teraGas).toBe(MAX_TOTAL_GAS_LIMIT.teraGas);
};

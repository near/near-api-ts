import { functionCall } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './actionsValidation.test';

// `max_total_prepaid_gas` from the runtime config — raised from 300 to 1000 TGas in protocol
// version 83 (`core/parameters/res/runtime_configs/83.yaml`).
const MAX_TOTAL_PREPAID_GAS = 1_000_000_000_000_000;
const TOTAL_PREPAID_TERA_GAS = '1001';

export const totalPrepaidGasExceeded = (context: TestContext) => async () => {
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
        gasLimit: { teraGas: TOTAL_PREPAID_TERA_GAS },
      }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      TotalPrepaidGasExceeded: {
        limit: MAX_TOTAL_PREPAID_GAS,
        totalPrepaidGas: Number(TOTAL_PREPAID_TERA_GAS) * 10 ** 12,
      },
    },
  });
};

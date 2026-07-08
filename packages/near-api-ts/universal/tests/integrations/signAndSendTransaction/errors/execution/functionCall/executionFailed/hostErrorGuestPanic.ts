import { expect } from 'vitest';
import { createMainnetClient } from '../../../../../../../index';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { log } from '../../../../../../utils/common';

export const hostErrorGuestPanic = () => async () => {
  const mainnetClient = createMainnetClient();

  const txResult = await mainnetClient.getTransactionResult({
    transactionHash: '9usBJmQ3J1e2XTULjjkuyXPrsyRmp3CxDDVtVMd4HWgF', // has old HostError::GuestPanic
    policies: { transport: { rpcTypePreferences: ['Archival', 'Regular'] } },
  });
  log(txResult);

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Execution.Failed');
  expect(txResult.result.error.context.cause).toBe(
    "Smart contract panicked: panicked at 'Request cannot " +
      "be deleted immediately after creation.', src/lib.rs:160:9",
  );
};

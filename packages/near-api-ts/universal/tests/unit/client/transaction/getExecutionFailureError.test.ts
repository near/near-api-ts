import type { ActionError } from '@near-js/jsonrpc-types';
import { describe, expect, it } from 'vitest';
import { getExecutionFailureError } from '../../../../src/createClient/methods/transaction/_common/_common/_common/getExecutionFailureError/getExecutionFailureError';

// Nearcore refuses new DelegateV2 (NEP-611) delegations since protocol 87, and this library no
// longer signs them, so a sandbox cannot produce these failures. Transactions sent before that
// still carry them - mainnet HdbSynSQmGBDeq4GHZAaZQYSwHH5nX1ivWm1Xxpv2rnH failed exactly like below.
describe('getExecutionFailureError › DelegateV2', () => {
  it('reports a delegation signed on a nonce channel the key does not have', () => {
    const actionError: ActionError = {
      index: 0,
      kind: { DelegateActionInvalidNonceIndex: { nonceIndex: 10, numNonces: 5 } },
    };

    expect(getExecutionFailureError(actionError, [])).toStrictEqual({
      kind: 'Action.ExecuteDelegation.NonceChannel.NotFound',
      context: { delegationNonceChannelId: 10, accessKeyChannelCount: 5 },
    });
  });
});

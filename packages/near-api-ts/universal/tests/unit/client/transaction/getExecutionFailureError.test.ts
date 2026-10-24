import type { ActionError, ActionView } from '@near-js/jsonrpc-types';
import { describe, expect, it } from 'vitest';
import { getExecutionFailureError } from '../../../../src/createClient/methods/transaction/_common/_common/_common/getExecutionFailureError/getExecutionFailureError';

// Nearcore refuses new DelegateV2 (NEP-611) delegations since protocol 87, and this library no
// longer signs them, so a sandbox cannot produce these failures. Transactions sent before that
// still carry them - mainnet HdbSynSQmGBDeq4GHZAaZQYSwHH5nX1ivWm1Xxpv2rnH failed like the first
// case below, DQtKJxfAxyp67SCGWCaeHQxv5wbfyawCYWiFP2QZW7kY like the second. Only which action the
// error index points at is read, so the actions hold nothing else.
describe('getExecutionFailureError › DelegateV2', () => {
  const delegateV2 = { DelegateV2: {} } as unknown as ActionView;
  const delegate = { Delegate: {} } as unknown as ActionView;

  const failureOf = (kind: ActionError['kind']): ActionError => ({ index: 0, kind });

  it('reports a delegation signed on a nonce channel the key does not have', () => {
    const actionError = failureOf({
      DelegateActionInvalidNonceIndex: { nonceIndex: 10, numNonces: 5 },
    });

    expect(getExecutionFailureError(actionError, [delegateV2], ['Live', 'Legacy'])).toStrictEqual({
      kind: 'Action.LegacyExecuteDelegation.NonceChannel.NotFound',
      context: { delegationNonceChannelId: 10, accessKeyChannelCount: 5 },
    });
  });

  it('reports a delegation signed on a nonce channel of a key that has none', () => {
    const actionError = failureOf({ DelegateActionAccessKeyError: 'DelegateActionRequiresGasKey' });

    expect(getExecutionFailureError(actionError, [delegateV2], ['Live', 'Legacy'])).toStrictEqual({
      kind: 'Action.LegacyExecuteDelegation.Delegator.AccessKey.NonceChannels.NotFound',
      context: null,
    });
  });

  // A failure both formats share is named after the action summary of the one that failed
  it('reports a failure of a NEP-611 delegation under its own name', () => {
    const expired = failureOf('DelegateActionExpired');
    const accessKeyNotFound = failureOf({
      DelegateActionAccessKeyError: {
        AccessKeyNotFound: { accountId: 'alice', publicKey: 'ed25519:key' },
      },
    });

    expect(getExecutionFailureError(expired, [delegateV2], ['Live', 'Legacy'])).toStrictEqual({
      kind: 'Action.LegacyExecuteDelegation.Expired',
      context: null,
    });
    expect(getExecutionFailureError(expired, [delegate], ['Live'])).toStrictEqual({
      kind: 'Action.ExecuteDelegation.Expired',
      context: null,
    });
    expect(
      getExecutionFailureError(accessKeyNotFound, [delegateV2], ['Live', 'Legacy']),
    ).toMatchObject({ kind: 'Action.LegacyExecuteDelegation.Delegator.AccessKey.NotFound' });
  });

  it('refuses a failure of a NEP-611 delegation in a transaction sent now', () => {
    expect(() =>
      getExecutionFailureError(failureOf('DelegateActionExpired'), [delegateV2], ['Live']),
    ).toThrow('Protocol 87 refuses a new DelegateV2');
  });
});

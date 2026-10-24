import type { ActionView } from '@near-js/jsonrpc-types';
import { describe, expect, it } from 'vitest';
import { constants, randomEd25519KeyPair } from '../../../../index';
import { getRawActionSummary } from '../../../../src/createClient/methods/transaction/_common/_common/_common/_common/getRawActionSummary/getRawActionSummary';

// Nearcore refuses new DelegateV2 (NEP-611) delegations since protocol 87, and this library no
// longer signs them, so a sandbox cannot produce one. Transactions sent before that still carry
// them, and the RPC reports them as nearcore's `ActionView::DelegateV2`, shaped like below.
describe('getRawActionSummary › DelegateV2', () => {
  const { publicKey } = randomEd25519KeyPair();
  const signature = `ed25519:${'1'.repeat(64)}`;

  const delegateV2 = (nonce: unknown, actions: unknown[]) =>
    ({
      DelegateV2: {
        delegateAction: {
          V2: {
            senderId: 'alice',
            receiverId: 'alice',
            actions,
            nonce,
            maxBlockHeight: 1000,
            publicKey,
          },
        },
        signature,
      },
    }) as ActionView;

  it('reports a delegation signed on a nonce channel of a key paid from its own balance', () => {
    const summary = getRawActionSummary(
      delegateV2({ GasKeyNonce: { nonce: 7, nonceIndex: 1 } }, [
        { WithdrawFromGasKey: { publicKey, amount: '1000' } },
      ]),
      ['Live', 'Legacy'],
    );

    expect(summary).toStrictEqual({
      actionType: 'LegacyExecuteDelegation',
      delegation: {
        tag: constants.Delegation.Nep611Tag,
        delegator: {
          accountId: 'alice',
          publicKey,
          replayProtection: { scheme: 'NonceChannels', nonceChannelId: 1, nonce: 7 },
        },
        delegatedActionSummaries: [
          {
            actionType: 'LegacyWithdrawAccessKeyBalance',
            publicKey,
            amount: expect.objectContaining({ yoctoNear: 1000n }),
          },
        ],
        receiverAccountId: 'alice',
        expiration: { blockHeight: 1000 },
      },
      signature,
    });
  });

  it('reports a delegation signed on the single nonce channel of a key', () => {
    const summary = getRawActionSummary(
      delegateV2({ Nonce: { nonce: 7 } }, [{ Transfer: { deposit: '1' } }]),
      ['Live', 'Legacy'],
    );

    // Legacy too: protocol 87 refuses every NEP-611 delegation, whatever key signed it
    expect(summary).toMatchObject({
      actionType: 'LegacyExecuteDelegation',
      delegation: {
        tag: constants.Delegation.Nep611Tag,
        delegator: { replayProtection: { scheme: 'NonceChannel', nonce: 7 } },
      },
    });
  });
});

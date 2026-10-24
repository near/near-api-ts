import { describe, expect, it } from 'vitest';
import { randomEd25519KeyPair } from '../../../../index';
import { getDetailsFromProcessingStage } from '../../../../src/createClient/methods/transaction/sendSignedTransaction/handleRpcResult/getDetailsFromProcessingStage/getDetailsFromProcessingStage';

// Protocol 87 refuses a new DelegateV2 and a withdrawal inside a delegation, and the library signs
// neither, so a sandbox cannot be made to send one. The RPC results are built by hand and hold only
// the fields the builders read.
describe('legacy actions of a transaction sent now', () => {
  const { publicKey } = randomEd25519KeyPair();
  const signature = `ed25519:${'1'.repeat(64)}`;
  const cryptoHash = '11111111111111111111111111111111';

  const transfer = { Transfer: { deposit: '1' } };
  const withdrawal = { WithdrawFromGasKey: { publicKey, amount: '1' } };

  const delegateAction = (nonce: unknown, actions: unknown[]) => ({
    senderId: 'alice',
    receiverId: 'bob',
    actions,
    nonce,
    maxBlockHeight: 1000,
    publicKey,
  });

  const delegate = (actions: unknown[]) => ({
    Delegate: { delegateAction: delegateAction(7, actions), signature },
  });

  const delegateV2 = {
    DelegateV2: {
      delegateAction: { V2: delegateAction({ Nonce: { nonce: 7 } }, [transfer]) },
      signature,
    },
  };

  type Context = Parameters<typeof getDetailsFromProcessingStage>[0];

  const contextOf = (rpcResult: unknown) =>
    ({
      rpcResult,
      transactionHash: cryptoHash,
      signedTransactionBorsh64: 'AA==',
      protocolEras: ['Live'],
    }) as Context;

  const transactionOf = (actions: unknown[]) => ({
    signerId: 'relay',
    publicKey: { publicKey },
    nonce: 1,
    receiverId: 'alice',
    actions,
    signature: { signature },
    hash: { cryptoHash },
  });

  const convertedOutcome = {
    blockHash: { cryptoHash },
    outcome: { status: { SuccessReceiptId: { cryptoHash } }, tokensBurnt: '0', gasBurnt: 0 },
  };

  const includedFinal = (actions: unknown[]) =>
    contextOf({
      finalExecutionStatus: 'INCLUDED_FINAL',
      status: 'Started',
      transaction: transactionOf(actions),
      transactionOutcome: convertedOutcome,
      receipts: [],
      receiptsOutcome: [],
    });

  it('reports what the current protocol accepts', () => {
    const details = getDetailsFromProcessingStage(
      includedFinal([delegate([transfer]), withdrawal]),
      'ConvertedFinal',
    );

    // A withdrawal is refused only inside a delegation
    expect(details).toMatchObject({
      success: true,
      data: {
        processingSteps: {
          conversionStep: {
            transactionSummary: {
              actionSummaries: [
                { actionType: 'ExecuteDelegation' },
                { actionType: 'WithdrawAccessKeyBalance' },
              ],
            },
          },
        },
      },
    });
  });

  it('refuses a NEP-611 delegation', () => {
    expect(() =>
      getDetailsFromProcessingStage(includedFinal([delegateV2]), 'ConvertedFinal'),
    ).toThrow('Protocol 87 refuses a new DelegateV2');
  });

  it('refuses a withdrawal inside a delegation', () => {
    expect(() =>
      getDetailsFromProcessingStage(includedFinal([delegate([withdrawal])]), 'ConvertedFinal'),
    ).toThrow('Protocol 87 refuses a withdrawal from a key balance inside a delegation');
  });

  it('refuses one at a stage that reports execution', () => {
    const executed = contextOf({
      finalExecutionStatus: 'EXECUTED_OPTIMISTIC',
      status: { SuccessValue: '' },
      transaction: transactionOf([delegateV2]),
      transactionOutcome: convertedOutcome,
      receipts: [],
      receiptsOutcome: [],
    });

    expect(() => getDetailsFromProcessingStage(executed, 'ExecutedOptimistic')).toThrow(
      'Protocol 87 refuses a new DelegateV2',
    );
  });

  // `ConvertedOptimistic` reports the transaction hash only
  it('does not look into a transaction it does not report', () => {
    const included = contextOf({
      finalExecutionStatus: 'INCLUDED',
      status: 'Started',
      transaction: transactionOf([delegateV2]),
      transactionOutcome: convertedOutcome,
      receipts: [],
      receiptsOutcome: [],
    });

    expect(getDetailsFromProcessingStage(included, 'ConvertedOptimistic')).toMatchObject({
      success: true,
      data: { processingStage: 'ConvertedOptimistic' },
    });
  });

  // A conversion failure reports the error alone - on protocol 87 and later it is the only way a
  // chunk producer can still put a legacy action on chain
  it('reports the conversion failure of a transaction with a legacy action', () => {
    const invalid = contextOf({
      finalExecutionStatus: 'EXECUTED_OPTIMISTIC',
      status: { Failure: { InvalidTxError: 'Expired' } },
      transaction: transactionOf([delegateV2]),
      transactionOutcome: {
        blockHash: { cryptoHash },
        outcome: {
          status: { Failure: { InvalidTxError: 'Expired' } },
          tokensBurnt: '0',
          gasBurnt: 0,
        },
      },
      receipts: [],
      receiptsOutcome: [],
    });

    expect(getDetailsFromProcessingStage(invalid, 'ExecutedOptimistic')).toMatchObject({
      success: false,
      error: { kind: 'Client.SendSignedTransaction.Rpc.BlockHash.Expired' },
    });
  });
});

const x = {
  transactionHash: '4Y9wvJ3TrkLxRW1d8BMQH6amRWtaDqcLdwFG9RWp9RJd',
  result: { status: 'Success', data: '' },
  processingSteps: {
    conversionStep: {
      conversionStepId: '4Y9wvJ3TrkLxRW1d8BMQH6amRWtaDqcLdwFG9RWp9RJd',
      result: {
        status: 'Success',
        firstExecutionStepId: 'A595k7ebi9BVQaEzVXLL4q28AYqhNkPsqSpgjbLgnsbi',
      },
      executedAt: { blockHash: 'AS2CSjye9b2BCH9sPGTiV1rrGXCuTXCjRh7ecz6uCRif' },
      transactionSummary: {
        signerAccountId: 'test1111.eclipseer.testnet',
        signerPublicKey: 'ed25519:6RrvkTQKSo1DwW23rv3TWLhZZw5jySeW1AEVrLSfAhka',
        nonce: 252028318000001,
        receiverAccountId: 'test1111.eclipseer.testnet',
        actionSummaries: [
          {
            DeleteAccount: { beneficiaryId: '1252.test1111.eclipseer.testnet' },
          },
        ],
        signature:
          'ed25519:ZaXrUGvnb85UkFCkRjETjUmDjREjsz3FhuygTo5fpB2U2D5mTkTjv5ZUGQsSQWGgNajzS9DxqVeygKr3QRCGxsk',
      },
      gasFee: { near: '0.00002555485', yoctoNear: 25554850000000000000n },
      gasUsed: { teraGas: '0.2555485', gas: 255548500000n },
    },
    executionSteps: [
      {
        executionStepId: 'A595k7ebi9BVQaEzVXLL4q28AYqhNkPsqSpgjbLgnsbi',
        result: { status: 'Success', data: '' },
        createdAt: { blockHash: 'AS2CSjye9b2BCH9sPGTiV1rrGXCuTXCjRh7ecz6uCRif' },
        createdBy: {
          accountId: 'test1111.eclipseer.testnet',
          conversionStepId: '4Y9wvJ3TrkLxRW1d8BMQH6amRWtaDqcLdwFG9RWp9RJd',
        },
        executedAt: { blockHash: 'AS2CSjye9b2BCH9sPGTiV1rrGXCuTXCjRh7ecz6uCRif' },
        executedBy: { accountId: 'test1111.eclipseer.testnet' },
        producedSteps: [
          {
            kind: 'Refund',
            refundStepId: 'Hy22GUramMVzW99iWRpQHg7g3VrFQpEJq6B7qPSVCxhA',
          },
        ],
        actionSummaries: [
          {
            DeleteAccount: { beneficiaryId: '1252.test1111.eclipseer.testnet' },
          },
        ],
        requiredDataIds: [],
        futureDataReceivers: [],
        isPromiseYield: false,
        gasFee: { near: '0.00002555485', yoctoNear: 25554850000000000000n },
        gasUsed: { teraGas: '0.2555485', gas: 255548500000n },
        logs: [],
      },
    ],
    refundSteps: [
      {
        refundStepId: 'Hy22GUramMVzW99iWRpQHg7g3VrFQpEJq6B7qPSVCxhA',
        refundAmount: { near: '0.0999488903', yoctoNear: 99948890300000000000000n },
        result: {
          status: 'Error',
          error: {
            kind: 'Receiver.NotFound',
            receiverAccountId: '1252.test1111.eclipseer.testnet',
          },
        },
        createdAt: { blockHash: 'AS2CSjye9b2BCH9sPGTiV1rrGXCuTXCjRh7ecz6uCRif' },
        createdBy: {
          executionStepId: 'A595k7ebi9BVQaEzVXLL4q28AYqhNkPsqSpgjbLgnsbi',
        },
        executedAt: { blockHash: 'AXeLB2KyNc86qc2AattbqCjUjHbStmXqpaB8mVMo6wng' },
        executedBy: { accountId: '1252.test1111.eclipseer.testnet' },
      },
    ],
  },
};

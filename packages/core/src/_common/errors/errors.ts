/*
TxExecutionError: {
        InvalidTxError: { ActionsValidation: 'FunctionCallZeroAttachedGas' }
      }
 */
// 'Client.SendSignedTransaction.Rpc.InvalidRequestSchema' - REQUEST_VALIDATION_ERROR.PARSE_ERROR - should never happen - we check it here - InvalidInputArguments
const kind1 = [
  'Client.CreateClient.InvalidArgsSchema',
  'Client.GetAccountInfo.InvalidArgsSchema',
  'Client.GetAccountInfo.Rpc.InternalError',
  'Client.SendSignedTransaction.Rpc.InternalError',
  'Client.SendSignedTransaction.InvalidArgsSchema',
  'Client.SendSignedTransaction.Rpc.InvalidRequestSchema',
  'Client.GetTransaction.Rpc.InvalidRequestSchema',

  'Client.SendSignedTransaction.Rpc.Transaction.NotEnoughBalance',
  'Client.SendSignedTransaction.Rpc.Transaction.Action.FunctionCall.ExecutionError',

  'MemorySigner.ExecuteTransaction.MemoryKeyService.PrivateKeyNotFound',
  'MemorySigner.ExecuteTransaction.Client.GetAccountKeys.Rpc.AccountNotFound',
  'MemorySigner.ExecuteTransaction.Client.SendSignedTransaction.InvalidArgsSchema',
  'MemorySigner.ExecuteTransaction.Client.SendSignedTransaction.Rpc.Timeout',
  'MemorySigner.ExecuteTransaction.Client.SendSignedTransaction.Rpc.Transaction.NotEnoughBalance',
  'MemorySigner.ExecuteTransaction.Client.SendSignedTransaction.Rpc.Transaction.Action.FunctionCall.ExecutionError',
];

const kind2 = [
  {
    root: 'Client',
    kind: 'GetAccountInfo.InvalidArgsSchema',
  },
  {
    root: 'MemorySigner',
    kind: 'ExecuteTransaction.InvalidArgsSchema',
  },
  {
    root: 'MemorySigner.ExecuteTransaction.MemoryKeyService',
    kind: 'GetPrivateKey.PrivateKeyNotFound',
  },
  {
    root: 'MemorySigner.ExecuteTransaction.Client',
    kind: 'SendSignedTransaction.Rpc.Timeout',
  },
];

const kind3 = [
  {
    root: 'Client.GetAccountInfo',
    kind: 'InvalidArgsSchema',
  },
  {
    root: 'Client.SendSignedTransaction',
    kind: 'InvalidArgsSchema',
  },
  {
    root: 'MemorySigner.ExecuteTransaction',
    kind: 'InvalidArgsSchema',
  },
  {
    root: 'MemorySigner.ExecuteTransaction.MemoryKeyService',
    kind: 'GetPrivateKey.PrivateKeyNotFound',
  },
  {
    root: 'MemorySigner.ExecuteTransaction.Client.SendSignedTransaction',
    kind: 'Rpc.Timeout',
  },
];

const kind4 = [
  {
    root: '',
    kind: 'Client.GetAccountInfo.InvalidArgsSchema',
  },
  {
    root: '',
    kind: 'Client.SendSignedTransaction.InvalidArgsSchema',
  },
  {
    root: 'MemorySigner.ExecuteTransaction',
    kind: 'InvalidArgsSchema',
  },
  {
    root: 'MemorySigner.ExecuteTransaction',
    kind: 'MemoryKeyService.GetPrivateKey.PrivateKeyNotFound',
  },
  {
    root: 'MemorySigner.ExecuteTransaction',
    kind: 'Client.SendSignedTransaction.Rpc.Timeout',
  },
];

const kind5 = [
  'Client.GetAccountInfo.AccountNotFound',

  'MemorySigner.Client.GetAccountInfo.AccountNotFound',
  'MemorySigner.Client.GetAccountInfo.FetchFailed',
  'MemorySigner.SignerNotFound',

  'MemorySigner.ExecuteTransaction.FetchFailed',
];

// try {
// } catch (e) {
//   if (
//     isExecuteTransactionError(
//       e,
//       'Rpc.Transaction.Action.FunctionCall.ExecutionError',
//     )
//   ) {
//   }
// }

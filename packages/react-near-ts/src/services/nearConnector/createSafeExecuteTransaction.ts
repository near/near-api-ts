import type { NearConnector } from '@hot-labs/near-connect';
import { nearToken, nearGas } from 'near-api-ts';
import type {
  TransferAction as NatTransferAction,
  FunctionCallAction as NatFunctionCallAction,
} from 'near-api-ts';

const toHotAction = (
  action: NatTransferAction | NatFunctionCallAction,
): any => {
  if (action.actionType === 'Transfer')
    return {
      transfer: { deposit: nearToken(action.amount).yoctoNear },
    };

  if (action.actionType === 'FunctionCall')
    return {
      functionCall: {
        methodName: action.functionName,
        args: action.functionArgs,
        gas: nearGas(action.gasLimit).gas,
        deposit: action.attachedDeposit
          ? nearToken(action.attachedDeposit).yoctoNear
          : 0n,
      },
    };
};

const toHotActions = (intent: any) => {
  if (intent.action) return [toHotAction(intent.action)];

  if (intent.actions)
    return intent.actions.map((action: any) => toHotAction(action));

  return [];
};

export const createSafeExecuteTransaction =
  (connector: NearConnector) =>
  async ({ intent }: any) => {
    console.log('safeExecuteTransaction', intent);
    try {
      const wallet = await connector.wallet();
      const tx = await wallet.signAndSendTransaction({
        actions: toHotActions(intent),
        receiverId: intent.receiverAccountId,
      });
      return { value: { rawRpcResult: tx }, ok: true };
    } catch (e) {
      return { error: e, ok: false };
    }
  };

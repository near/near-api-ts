import type { CreateSafeExecuteTransaction } from '../../../../types/services/nearConnector.ts';
import { result } from '../../../_common/utils/result.ts';
import { toNearConnectActions } from './toNearConnectActions.ts';

export const createSafeExecuteTransaction: CreateSafeExecuteTransaction =
  (connector) => async (args) => {
    try {
      const wallet = await connector.wallet();

      const finalExecutionOutcome = await wallet.signAndSendTransaction({
        actions: toNearConnectActions(args.intent),
        receiverId: args.intent.receiverAccountId,
      });

      return result.ok({ rawRpcResult: finalExecutionOutcome });
    } catch (e) {
      return result.err(e);
    }
  };

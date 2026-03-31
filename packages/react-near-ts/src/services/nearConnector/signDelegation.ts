import type { NearConnector } from '@hot-labs/near-connect';
import type { CreateSafeSignDelegation } from '../../../types/services/nearConnector.ts';
import { result } from '../../_common/utils/result.ts';
import { toNearConnectActions } from './_common/toNearConnectActions.ts';

export const createSafeSignDelegation: CreateSafeSignDelegation =
  (connector: NearConnector) => async (args) => {
    // TODO Validate args
    try {
      const wallet = await connector.wallet();

      const { signedDelegateActions } = await wallet.signDelegateActions({
        delegateActions: [
          {
            actions: toNearConnectActions(args.intent),
            receiverId: args.intent.receiverAccountId,
          },
        ],
      });

      const borsh64SignedDelegation = signedDelegateActions[0];
      // TODO need to unpack to borsh64SignedDelegation to delegation + signature

      return result.ok({ borsh64SignedDelegation });
    } catch (e) {
      return result.err(e);
    }
  };

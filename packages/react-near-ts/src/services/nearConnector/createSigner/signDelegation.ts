import type { NearConnector } from '@hot-labs/near-connect';
import type {
  CreateCanSignDelegation,
  CreateSafeSignDelegation,
} from '../../../../types/services/nearConnector.ts';
import { result } from '../../../_common/utils/result.ts';
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

      const signedDelegationBorsh64 = signedDelegateActions[0];
      // TODO need to unpack to signedDelegationBorsh64 to delegation + signature

      return result.ok({ signedDelegationBorsh64 });
    } catch (e) {
      return result.err(e);
    }
  };

// We assume that if the wallet declares that it supports signDelegation, then it supports signDelegation;
export const createCanSignDelegation: CreateCanSignDelegation = (connector) => (_args) =>
  connector.features.signDelegateActions === true;

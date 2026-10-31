import type { NearConnector } from '@hot-labs/near-connect';
import type {
  CreateCanSignDelegation,
  CreateSafeSignDelegation,
} from '../../../../types/services/nearConnector.ts';
import { result } from '../../../_common/utils/result.ts';
import { toNearConnectDelegableActions } from './_common/toNearConnectActions.ts';

// A near-connect wallet picks the expiration of a delegation itself - near-connect can't pass one
// on - so an intent with an expiration of its own is refused rather than signed with another one
const expirationNotSupportedError = () =>
  new Error(
    'A near-connect wallet picks the expiration of a delegation itself - leave expiration out ' +
      'of the intent',
  );

export const createSafeSignDelegation: CreateSafeSignDelegation =
  (connector: NearConnector) => async (args) => {
    // TODO Validate args
    if (args.intent.expiration !== undefined) return result.err(expirationNotSupportedError());

    try {
      const wallet = await connector.wallet();

      const { signedDelegateActions } = await wallet.signDelegateActions({
        delegateActions: [
          {
            actions: toNearConnectDelegableActions(args.intent),
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
// It never signs an intent with an expiration, see createSafeSignDelegation
export const createCanSignDelegation: CreateCanSignDelegation = (connector) => (args) =>
  connector.features.signDelegateActions === true && args.intent.expiration === undefined;

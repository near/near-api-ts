import { NearConnector } from '@hot-labs/near-connect';
import * as z from 'zod/mini';
import type {
  CreateNearConnectorServiceArgs,
  NearConnectorServiceCreator,
} from '../../../types/services/nearConnector.ts';

/**
 * We want to make sure that the dapp user can connect only a wallet that supports the
 * features that the dapp developer will use;
 * For example, it doesn't make sense to allow the dapp developer to use a hook like
 * useNearSignIn({ additionalAction: 'signMessage' })
 * if the wallet doesn't support signIn + signMessage;
 */
const getSupportedFeatures = (createArgs?: CreateNearConnectorServiceArgs) => {
  const features: NearConnector['features'] = {
    signMessage: false,
    signTransaction: false,
    signAndSendTransaction: true, // executeTransaction
    signAndSendTransactions: false,
    signInWithoutAddKey: true, // signIn without additional action
    signInAndSignMessage: false,
    signInWithFunctionCallKey: false,
    signDelegateActions: false,
  };

  if (!createArgs?.supportedFeatures) return features;

  const { supportedFeatures } = createArgs;

  if (supportedFeatures.signInAdditionalAction?.signMessage) {
    features.signInAndSignMessage = true;
  }
  if (supportedFeatures.signInAdditionalAction?.addFunctionCallKey) {
    features.signInWithFunctionCallKey = true;
  }
  if (supportedFeatures.signMessage) {
    features.signMessage = true;
  }
  if (supportedFeatures.signDelegation) {
    features.signDelegateActions = true;
  }

  return features;
};

const NetworkIdZodSchema = z.enum(['mainnet', 'testnet']);

export const createCreateService =
  (createArgs?: CreateNearConnectorServiceArgs): NearConnectorServiceCreator['createService'] =>
  (args) => {
    const validNetworkId = NetworkIdZodSchema.parse(args.networkId);

    const connector = new NearConnector({
      network: validNetworkId,
      features: getSupportedFeatures(createArgs),
    });

    return {
      serviceId: 'nearConnector',
      serviceBox: { connector },
    };
  };

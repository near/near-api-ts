import { useMutation } from '@tanstack/react-query';
import { useNearStore } from '../store/NearStoreProvider.tsx';
import type { StoreContext } from '../../types/store.ts';
import type { UseSignMessage } from '../../types/hooks/useSignMessage.ts';
import type { SignMessageArgs } from '../../types/services/_common.ts';
import type { NearConnector } from '@hot-labs/near-connect';

const tryOnManySigners = async (args: SignMessageArgs, context: StoreContext) => {
  try {
    const nearConnector = context.serviceCreators.find((s) => s.serviceId === 'nearConnector');
    if (!nearConnector) throw new Error('No nearConnector available');

    const connector = context.services.nearConnector.serviceBox.connector as NearConnector;

    const wallet = await connector.wallet();

    const signedMessage = await wallet.signMessage({
      message: args.message.data,
      recipient: args.message.recipient,
      nonce: args.message.nonce,
      // signerId: 'lantstool.testnet',
      // signerId: 'lantstool.near',
      // network: 'mainnet',
    });

    console.log('signedMessage', signedMessage);
    return signedMessage;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// const tryOnManySigners = async (args: SignMessageArgs, context: StoreContext) => {
//   const signers = context.signers;
//   if (signers.length === 0) throw new Error('No signers available');
//
//   const signMessage = async (signerIndex: number) => {
//     const signer = signers[signerIndex];
//
//     const result = await signer.safeSignMessage(args);
//     if (result.ok) return result.value;
//
//     // TODO right now we only support one signer - we will support multiple signers after adding
//     // canExecuteTransaction method to all signers
//     throw result.error;
//   };
//
//   return signMessage(0);
// };

export const useSignMessage: UseSignMessage = () => {
  const getContext = useNearStore((s) => s.getContext);
  const context = getContext();

  return useMutation({
    mutationFn: (args) => tryOnManySigners(args, context),
  });
};

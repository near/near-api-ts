import type { CreateSafeSignMessage } from '../../../types/services/nearConnect.ts';
import { result } from '../../_common/utils/result.ts';

export const createSafeSignMessage: CreateSafeSignMessage = (connector) => async (args) => {
  try {
    const wallet = await connector.wallet('meteor-wallet');

    const signedMessage = await wallet.signMessage({
      message: args.message.data,
      recipient: args.message.recipient,
      nonce: args.message.nonce,
      signerId: 'lantstool.near',
      network: 'mainnet',
    });
    console.log('signedMessage', signedMessage);
    return result.ok(signedMessage);
  } catch (e) {
    console.log(e);
    return result.err(e);
  }
};

import type { AddKeyAction } from 'nat-types/actions/addKey';
import type { PublicKey } from 'nat-types/crypto';

type AddFullAccessKeyInput = {
  publicKey: PublicKey;
};

export const addFullAccessKey = ({
  publicKey,
}: AddFullAccessKeyInput): AddKeyAction => ({
  type: 'AddKey',
  params: {
    type: 'FullAccess',
    publicKey,
  },
});

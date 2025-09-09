import type {
  AddKeyAction,
  FullAccessKeyParams,
} from 'nat-types/actions/addKey';

export const addFullAccessKey = ({
  publicKey,
}: Omit<FullAccessKeyParams, 'accessType'>): AddKeyAction => ({
  actionType: 'AddKey',
  params: {
    accessType: 'FullAccess',
    publicKey,
  },
});

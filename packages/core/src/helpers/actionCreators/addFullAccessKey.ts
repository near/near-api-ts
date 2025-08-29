import type {
  AddKeyAction,
  FunctionCallKeyParams,
} from 'nat-types/actions/addKey';

export const addFullAccessKey = ({
  publicKey,
}: Omit<FunctionCallKeyParams, 'accessType'>): AddKeyAction => ({
  actionType: 'AddKey',
  params: {
    accessType: 'FullAccess',
    publicKey,
  },
});

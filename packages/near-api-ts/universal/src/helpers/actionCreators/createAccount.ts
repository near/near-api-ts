import type { CreateAccountAction } from '../../../types/actions/createAccount';

export const createAccount = (): CreateAccountAction => ({
  actionType: 'CreateAccount',
});

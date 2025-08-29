import type { CreateAccountAction } from 'nat-types/actions/createAccount';

export const createAccount = (): CreateAccountAction => ({
  actionType: 'CreateAccount',
});

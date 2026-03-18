import type { CreateAccountAction } from '../../../types/_common/transaction/actions/createAccount';

export const createAccount = (): CreateAccountAction => ({
  actionType: 'CreateAccount',
});

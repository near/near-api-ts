import type { CreateAccountAction } from '@universal/types/_common/transaction/actions/createAccount';

export const createAccount = (): CreateAccountAction => ({
  actionType: 'CreateAccount',
});

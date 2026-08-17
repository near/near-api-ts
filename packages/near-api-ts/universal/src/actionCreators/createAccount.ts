import type { CreateAccountAction } from '../../types/_common/transaction/actions/delegableActions/createAccount';

export const createAccount = (): CreateAccountAction => ({
  actionType: 'CreateAccount',
});

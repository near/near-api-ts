import type { CreateAccountAction } from '../../types/_common/transaction/actions/nonDelegateActions/createAccount';

export const createAccount = (): CreateAccountAction => ({
  actionType: 'CreateAccount',
});

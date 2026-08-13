import type { NearcoreCreateAccountAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/createAccount';

export const toNearcoreCreateAccountAction = (): NearcoreCreateAccountAction => ({
  createAccount: {},
});

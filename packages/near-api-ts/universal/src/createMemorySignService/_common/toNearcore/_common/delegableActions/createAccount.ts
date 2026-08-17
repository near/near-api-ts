import type { NearcoreCreateAccountAction } from '../../../../../../types/_common/transaction/actions/delegableActions/createAccount';

export const toNearcoreCreateAccountAction = (): NearcoreCreateAccountAction => ({
  createAccount: {},
});

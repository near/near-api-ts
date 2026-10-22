import type { CreateSubAccountAction } from '../../../types/_common/transaction/actions/delegableActions/createSubAccount';

export const createSubAccount = (): CreateSubAccountAction => ({
  actionType: 'CreateSubAccount',
});

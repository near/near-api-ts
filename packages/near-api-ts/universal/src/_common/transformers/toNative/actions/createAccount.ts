import type { NativeCreateAccountAction } from '../../../../../types/_common/transaction/actions/createAccount';

export const toNativeCreateAccountAction = (): NativeCreateAccountAction => ({
  createAccount: {},
});

import type { NativeCreateAccountAction } from '@universal/types/_common/transaction/actions/createAccount';

export const toNativeCreateAccountAction = (): NativeCreateAccountAction => ({
  createAccount: {},
});

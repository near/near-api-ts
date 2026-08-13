import type { NativeCreateAccountAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/createAccount';

export const toNativeCreateAccountAction = (): NativeCreateAccountAction => ({
  createAccount: {},
});

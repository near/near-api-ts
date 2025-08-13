import type { NativeCreateAccountAction } from 'nat-types/actions/createAccount';

export const toNativeCreateAccountAction = (): NativeCreateAccountAction => ({
  createAccount: {},
});

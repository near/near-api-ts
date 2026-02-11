import type { NativeCreateAccountAction } from '../../../../../types/actions/createAccount';

export const toNativeCreateAccountAction = (): NativeCreateAccountAction => ({
  createAccount: {},
});

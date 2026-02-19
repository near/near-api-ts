import type { NativeCreateAccountAction } from '@universal/types/actions/createAccount';

export const toNativeCreateAccountAction = (): NativeCreateAccountAction => ({
  createAccount: {},
});

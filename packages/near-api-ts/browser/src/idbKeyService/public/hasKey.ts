import { result } from '@universal/src/_common/utils/result';

export const createHasKeyPair = (context: any) => async (args: any) => {
  try {
    const keyPair = context.getKeyPair(args.publicKey);
    return result.ok(true);
  } catch (e) {
    return result.err(false);
  }
};

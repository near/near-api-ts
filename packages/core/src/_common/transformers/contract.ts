import type { FnArgs } from 'nat-types/contract';
import { toJsonBytes } from '@common/utils/common';

export const toContractFnArgsBytes = <A>(args: FnArgs<A>): Uint8Array => {
  if (args.fnArgsBytes) return args.fnArgsBytes;
  if (args.fnArgsJson) return toJsonBytes(args.fnArgsJson);
  return new Uint8Array();
};

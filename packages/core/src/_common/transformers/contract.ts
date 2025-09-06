import type { FnArgs } from 'nat-types/contract';
import type { MaybeJsonLikeValue } from 'nat-types/common';
import { toJsonBytes } from '@common/utils/common';

export const toContractFnArgsBytes = <AJ extends MaybeJsonLikeValue>(
  args: FnArgs<AJ>,
): Uint8Array => {
  if (args.fnArgsBytes) return args.fnArgsBytes;
  if (args.fnArgsJson) return toJsonBytes(args.fnArgsJson);
  return new Uint8Array();
};

import type { NearcoreUseGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/useGlobalContract';
import type { InnerUseGlobalContractAction } from '../zodSchemas/useGlobalContract';

export const toNearcoreUseGlobalContractAction = (
  action: InnerUseGlobalContractAction,
): NearcoreUseGlobalContractAction => ({
  useGlobalContract: {
    contractIdentifier: action.wasmHash
      ? { codeHash: action.wasmHash.cryptoHashU8 }
      : { accountId: action.ownerAccountId },
  },
});

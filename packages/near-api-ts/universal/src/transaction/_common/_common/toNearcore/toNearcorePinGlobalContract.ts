import type { NearcorePinGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/pinGlobalContract';
import type { InnerPinGlobalContractAction } from '../zodSchemas/pinGlobalContract';

export const toNearcorePinGlobalContractAction = (
  action: InnerPinGlobalContractAction,
): NearcorePinGlobalContractAction => ({
  useGlobalContract: {
    contractIdentifier: { codeHash: action.globalContractWasmHash.cryptoHashU8 },
  },
});

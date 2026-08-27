import type { NearcoreRegisterGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/registerGlobalContract';
import type { InnerRegisterGlobalContractAction } from '../zodSchemas/registerGlobalContract';

export const toNearcoreRegisterGlobalContractAction = (
  action: InnerRegisterGlobalContractAction,
): NearcoreRegisterGlobalContractAction => ({
  deployGlobalContract: {
    code: action.wasmBytes,
    deployMode: action.referenceBy === 'WasmHash' ? { codeHash: {} } : { accountId: {} },
  },
});

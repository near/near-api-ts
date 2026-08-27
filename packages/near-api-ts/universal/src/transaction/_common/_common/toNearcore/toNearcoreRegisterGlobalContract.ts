import type { NearcoreRegisterGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/registerGlobalContract';
import type { InnerRegisterGlobalContractAction } from '../zodSchemas/registerGlobalContract';

export const toNearcoreRegisterGlobalContractAction = (
  action: InnerRegisterGlobalContractAction,
): NearcoreRegisterGlobalContractAction => ({
  deployGlobalContract: {
    code: action.wasmU8,
    // Immutable code is addressed by its own hash, mutable code by the account
    // that registered it - that account is what makes replacing it possible.
    deployMode: action.wasmMutability === 'Immutable' ? { codeHash: {} } : { accountId: {} },
  },
});

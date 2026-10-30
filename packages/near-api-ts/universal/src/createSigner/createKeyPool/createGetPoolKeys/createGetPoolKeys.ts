import type { CreateSignerArgs } from '../../../../types/signer/createSigner';
import type { GetPoolKeys, KeyPoolState } from '../../../../types/signer/inner/keyPool';
import type { SignerContext } from '../../../../types/signer/signer';
import { createNatError } from '../../../_common/_common/_common/_common/natError';
import { result } from '../../../_common/_common/_common/result';
import { createContractFunctionCallPoolKeys } from './createContractFunctionCallPoolKeys';
import { createFullAccessPoolKeys } from './createFullAccessPoolKeys';
import { getAllowedAccessKeys } from './getAllowedAccessKeys';

// We use this function to create a pool only once and then reuse it for all tasks;
// We want to avoid unnecessary network requests;
export const createGetPoolKeys =
  (
    state: KeyPoolState,
    signerContext: SignerContext,
    createSignerArgs: CreateSignerArgs,
  ): GetPoolKeys =>
  async () => {
    // 1. If pool keys already exist - return them;
    // We will recreate it only when it makes sense:
    // for example, when a user adds a new key to the pool;
    if (state.poolKeys)
      return result.ok({
        fullAccess: state.poolKeys.fullAccess,
        contractFunctionCall: state.poolKeys.contractFunctionCall,
      });

    // 2. If we are loading access keys right now - await for the result -
    // we don't want to create a duplicated list every time;
    if (state.poolKeysLoadingPromise) return await state.poolKeysLoadingPromise;

    const loadAccessKeys = async () => {
      // 3. Fetch account access keys from the network;
      const accessKeys = await signerContext.client.safeGetAccessKeys({
        accountId: signerContext.signerAccountId,
        atMomentOf: 'LatestOptimisticBlock',
      });

      if (!accessKeys.success)
        return result.err(
          createNatError({
            kind: 'Signer.KeyPool.AccessKeys.NotLoaded',
            context: { cause: accessKeys.error },
          }),
        );

      // 4. If a user wants to handle all tasks only by a specific key/s - remove others;
      const allowedAccessKeys = getAllowedAccessKeys(accessKeys.data.accessKeys, createSignerArgs);

      // 5. Create pool keys of the allowed keys the signer can sign by;
      const [fullAccessPoolKeys, contractFunctionCallPoolKeys] = await Promise.all([
        createFullAccessPoolKeys(allowedAccessKeys, signerContext),
        createContractFunctionCallPoolKeys(allowedAccessKeys, signerContext),
      ]);

      if (!fullAccessPoolKeys.success) return fullAccessPoolKeys;
      if (!contractFunctionCallPoolKeys.success) return contractFunctionCallPoolKeys;

      // 6. The pool is empty when no key is left after every filter - not allowed,
      // a gas key, or one the sign service doesn't hold;
      if (fullAccessPoolKeys.data.length === 0 && contractFunctionCallPoolKeys.data.length === 0)
        return result.err(
          createNatError({
            kind: 'Signer.KeyPool.Empty',
            context: {
              accessKeys: accessKeys.data.accessKeys,
              allowedAccessKeys: createSignerArgs.keyPool?.allowedAccessKeys ?? [],
            },
          }),
        );

      state.poolKeys = {
        fullAccess: fullAccessPoolKeys.data,
        contractFunctionCall: contractFunctionCallPoolKeys.data,
      };

      return result.ok(state.poolKeys);
    };

    // A failed load is not kept, so the next task loads the keys again
    state.poolKeysLoadingPromise = loadAccessKeys().finally(() => {
      state.poolKeysLoadingPromise = undefined;
    });

    return await state.poolKeysLoadingPromise;
  };

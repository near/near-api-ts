import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { CreateMemorySignerArgs } from 'nat-types/signers/memorySigner/createMemorySigner';
import type {
  GetPoolKeys,
  KeyPoolState,
} from 'nat-types/signers/memorySigner/keyPool';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { getAllowedAccessKeys } from './getAllowedAccessKeys';
import { createFullAccessPoolKeys } from './createFullAccessPoolKeys';
import { createFunctionCallPoolKeys } from './createFunctionCallPoolKeys';

// We use this function to create a pool only once and then reuse it for all tasks;
// We want to avoid unnecessary network requests;
export const createGetPoolKeys =
  (
    state: KeyPoolState,
    signerContext: MemorySignerContext,
    createMemorySignerArgs: CreateMemorySignerArgs,
  ): GetPoolKeys =>
  async () => {
    // 1. If pool keys already exist - return them;
    // We will recreate it only when it makes sense:
    // for example, when a user adds a new key to the pool;
    if (state.poolKeys)
      return result.ok({
        fullAccess: state.poolKeys.fullAccess,
        functionCall: state.poolKeys.functionCall,
      });

    // 2. Fetch account access keys from the network;
    const accountAccessKeys =
      await signerContext.client.safeGetAccountAccessKeys({
        accountId: signerContext.signerAccountId,
        atMomentOf: 'LatestFinalBlock',
      });

    if (!accountAccessKeys.ok)
      return result.err(
        createNatError({
          kind: 'MemorySigner.KeyPool.AccessKeys.NotLoaded',
          context: { cause: accountAccessKeys.error },
        }),
      );

    // 3. If a user wants to handle all tasks only by a specific key/s - remove others;
    const allowedAccessKeys = getAllowedAccessKeys(
      accountAccessKeys.value.accountAccessKeys,
      createMemorySignerArgs,
    );

    if (allowedAccessKeys.length === 0)
      return result.err(
        createNatError({
          kind: 'MemorySigner.KeyPool.Empty',
          context: {
            accountAccessKeys: accountAccessKeys.value.accountAccessKeys,
            allowedAccessKeys:
              createMemorySignerArgs.keyPool?.allowedAccessKeys ?? [],
          },
        }),
      );

    // 4. Create pool keys and return them;
    state.poolKeys = {
      fullAccess: createFullAccessPoolKeys(allowedAccessKeys, signerContext),
      functionCall: createFunctionCallPoolKeys(
        allowedAccessKeys,
        signerContext,
      ),
    };

    return result.ok(state.poolKeys);
  };

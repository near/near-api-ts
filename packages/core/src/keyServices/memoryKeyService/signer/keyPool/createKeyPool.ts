import type { Context as KeyServiceContext } from 'nat-types/keyServices/memoryKeyService';
import { createFindKeyForTask } from './createFindKeyForTask';

const createLock = (key: any) => () => {
  key.isLocked = true;
};

const createUnlock = (key: any, signerContext: any) => () => {
  key.isLocked = false;
  signerContext.matcher.handleKeyUnlock(key);
};

const createIncrementNonce = (key: any) => () => {
  key.nonce = key.nonce + 1;
};

const getFullAccessKeyList = (accountKeys: any, keyPairs: any, signerContext: any) =>
  accountKeys
    .filter(
      ({ publicKey, accessKey }: any) =>
        Object.hasOwn(keyPairs, publicKey) &&
        accessKey.permission === 'FullAccess',
    )
    .map(({ publicKey, accessKey }: any) => {
      const key: any = {
        permission: 'FullAccess',
        publicKey,
        privateKey: keyPairs[publicKey].privateKey,
        isLocked: false,
        nonce: accessKey.nonce,
      };
      key.lock = createLock(key);
      key.unlock = createUnlock(key, signerContext);
      key.incrementNonce = createIncrementNonce(key);

      return key;
    });

// TODO Add key methods!
const getFunctionCallKeyList = (accountKeys: any, keyPairs: any) =>
  accountKeys
    .filter(
      ({ publicKey, accessKey }: any) =>
        Object.hasOwn(keyPairs, publicKey) &&
        Object.hasOwn(accessKey.permission, 'FunctionCall'),
    )
    .map(({ publicKey, accessKey }: any) => ({
      permission: 'FunctionCall',
      publicKey,
      privateKey: keyPairs[publicKey].privateKey,
      isLocked: false,
      nonce: accessKey.nonce,
      // TODO Consider rename the RPC response
      contractAccountId: accessKey.permission.FunctionCall.receiverId,
      gasBudget: accessKey.permission.FunctionCall.allowance
        ? accessKey.permission.FunctionCall.allowance
        : undefined,
      allowedFunctions:
        accessKey.permission.FunctionCall.methodNames.length > 0
          ? accessKey.permission.FunctionCall.methodNames
          : undefined,
    }));

export const createKeyPool = async (
  signerContext: any,
  keyServiceContext: KeyServiceContext,
) => {
  const { keys } = await signerContext.client.getAccountKeys({
    accountId: signerContext.signerAccountId,
  });

  const keyList = {
    fullAccess: getFullAccessKeyList(
      keys,
      keyServiceContext.keyPairs,
      signerContext,
    ),
    functionCall: getFunctionCallKeyList(keys, keyServiceContext.keyPairs),
  };

  return {
    findKeyForTask: createFindKeyForTask(keyList),
  };
};

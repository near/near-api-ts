import {
  createIncrementNonce,
  createLock,
  createUnlock,
} from './helpers/keyUtils';

const transformKey = (
  publicKey: any,
  accessKey: any,
  keyPairs: any,
  signerContext: any,
) => {
  const key: any = {
    permission: 'FunctionCall',
    publicKey,
    privateKey: keyPairs[publicKey].privateKey,
    isLocked: false,
    nonce: accessKey.nonce,

    // TODO Consider rename the RPC response
    contractAccountId: accessKey.permission.FunctionCall.receiverId,

    gasBudget: accessKey.permission.FunctionCall.allowance
      ? { yoctoNear: BigInt(accessKey.permission.FunctionCall.allowance) }
      : undefined,

    allowedFunctions:
      accessKey.permission.FunctionCall.methodNames.length > 0
        ? accessKey.permission.FunctionCall.methodNames
        : undefined,
  };

  console.log(key);

  key.lock = createLock(key);
  key.unlock = createUnlock(key, signerContext);
  key.incrementNonce = createIncrementNonce(key);

  return key;
};

export const getFunctionCallKeyList = (
  accountKeys: any,
  keyPairs: any,
  signerContext: any,
) =>
  accountKeys
    .filter(
      ({ publicKey, accessKey }: any) =>
        Object.hasOwn(keyPairs, publicKey) &&
        Object.hasOwn(accessKey.permission, 'FunctionCall'),
    )
    .map(({ publicKey, accessKey }: any) =>
      transformKey(publicKey, accessKey, keyPairs, signerContext),
    );

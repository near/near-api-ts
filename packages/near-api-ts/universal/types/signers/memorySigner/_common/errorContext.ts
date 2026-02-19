import type { GetAccountAccessKeysError } from '@universal/types/client/methods/account/getAccountAccessKeys';
import type { AccountAccessKey } from '@universal/types/_common/accountAccessKey';
import type { PublicKey } from '@universal/types/_common/crypto';
import type { AccessTypePriority } from '@universal/types/signers/memorySigner/inner/taskQueue';
import type { PoolKeys } from '@universal/types/signers/memorySigner/inner/keyPool';
import type { Milliseconds } from '@universal/types/_common/common';

export type MemorySignerErrorContext = {
  KeyPool: {
    AccessKeys: {
      NotLoaded: { cause: GetAccountAccessKeysError };
    };
    Empty: {
      accountAccessKeys: AccountAccessKey[];
      allowedAccessKeys: PublicKey[];
    };
    SigningKey: {
      NotFound: {
        poolKeys: PoolKeys;
        accessTypePriority: AccessTypePriority;
      };
    };
  };
  TaskQueue: {
    Timeout: { timeoutMs: Milliseconds };
  };
};

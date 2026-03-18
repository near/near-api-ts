import type { AccountAccessKey } from '../../../_common/accountAccessKey';
import type { Milliseconds } from '../../../_common/common';
import type { PublicKey } from '../../../_common/crypto';
import type { GetAccountAccessKeysError } from '../../../client/methods/account/getAccountAccessKeys';
import type { PoolKeys } from '../inner/keyPool';
import type { AccessTypePriority } from '../inner/taskQueue';

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

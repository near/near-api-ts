import type { AccessKey } from '../../_common/accessKey';
import type { Milliseconds } from '../../_common/common';
import type { PublicKey } from '../../_common/crypto';
import type { GetAccessKeysError } from '../../client/methods/account/getAccessKeys';
import type { PoolKeys } from '../inner/keyPool';
import type { AccessTypePriority } from '../inner/taskQueue';

export type MemorySignerErrorContext = {
  KeyPool: {
    AccessKeys: {
      NotLoaded: { cause: GetAccessKeysError };
    };
    Empty: {
      accessKeys: AccessKey[];
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

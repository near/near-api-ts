import type { AccessKey } from '../../_common/accessKey';
import type { Milliseconds } from '../../_common/common';
import type { PublicKey } from '../../_common/crypto';
import type { GetAccessKeysError } from '../../client/methods/account/getAccessKeys';
import type { PoolKeys } from '../inner/keyPool';
import type { AccessTypePriority } from '../inner/taskQueue';

export type SignerErrorContext = {
  KeyPool: {
    AccessKeys: {
      NotLoaded: { cause: GetAccessKeysError };
    };
    /**
     * No account key is left to sign by: `allowedAccessKeys` leaves them out, they are gas
     * keys, or the sign service doesn't hold them.
     */
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

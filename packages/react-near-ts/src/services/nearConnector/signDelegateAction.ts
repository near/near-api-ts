import {
  AccountIdSchema,
  Base64StringSchema,
  PublicKeySchema,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from 'near-api-ts';
import * as z from 'zod/mini';
import type { CreateSafeSignMessage } from '../../../types/services/nearConnector.ts';
import { result } from '../../_common/utils/result.ts';
import type { NearConnector } from '@hot-labs/near-connect';

export const createSafeSignDelegateAction: any =
  (connector: NearConnector) => async (args: any) => {
    // TODO Validate args
    try {
      const wallet = await connector.wallet();

      const res = await wallet.signDelegateActions({
        delegateActions: [{
          actions: [{
            transfer1: {
              amount: '100000000000000000000000000',
            },
          }],
          receiverId: 'testnet'
        }]
      });

      return result.ok({});
    } catch (e) {
      return result.err(e);
    }
  };

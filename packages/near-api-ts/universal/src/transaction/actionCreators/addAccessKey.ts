import type {
  AddAccessKeyAction,
  CreateAddAccessKeyAction,
  SafeCreateAddAccessKeyAction,
} from '../../../types/_common/transaction/actions/delegableActions/addAccessKey';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { nearToken } from '../../_common/nearToken';
import { AddAccessKeyArgsZodSchema } from '../_common/_common/zodSchemas/addAccessKey';

export const safeAddAccessKey: SafeCreateAddAccessKeyAction = wrapInternalError(
  'CreateAction.AddAccessKey.Internal',
  (args) => {
    const validArgs = AddAccessKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.AddAccessKey.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const { publicKey, permission, gasPayment, replayProtection } = args;

    const base = { actionType: 'AddAccessKey' as const, publicKey, permission };

    // The action spells out what the arguments leave implied. Only a key paid from its own
    // balance keeps a set of nonce channels - the schema above requires them together.
    if (replayProtection)
      return result.ok({
        ...base,
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { scheme: 'NonceChannels', channelCount: replayProtection.channelCount },
      } as AddAccessKeyAction);

    // A key paid from the account balance keeps a single nonce channel. A full access key has no
    // allowance in the arguments: it spends as much as the account holds.
    const { allowance } = gasPayment;

    return result.ok({
      ...base,
      gasPayment: {
        source: 'AccountBalance',
        allowance:
          allowance === undefined || allowance === 'Unlimited' ? 'Unlimited' : nearToken(allowance),
      },
      replayProtection: { scheme: 'NonceChannel' },
    } as AddAccessKeyAction);
  },
);

export const addAccessKey: CreateAddAccessKeyAction = asThrowable(safeAddAccessKey);

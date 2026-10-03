import * as z from 'zod/mini';
import { constants } from '../../../../_common/_common/_common/constants';

// Nearcore checks the id against the key's own channel count; this is only the bound every key
// shares - a key never has more than MaxChannelCount channels.
export const NonceChannelIdZodSchema = z
  .number()
  .check(z.int(), z.gte(0), z.lt(constants.NonceChannels.MaxChannelCount));

import * as v from 'valibot';
import { base58 } from '@scure/base';
import { Base58StringSchema } from './common';
import { BinaryCryptoHashLength } from '../../configs/constants';

export const Base58CryptoHashSchema = v.pipe(
  Base58StringSchema,
  v.check((value) => {
    const u8Value = base58.decode(value);
    return u8Value.length === BinaryCryptoHashLength;
  }, `Binary Crypto Hash length should be exactly ${BinaryCryptoHashLength} bytes`),
);

import type { Base64String } from '../../../types/_common/common';
import { fromJsonBytes } from './common';

export const tryParseBase64ToObject = (dataBase64: Base64String): unknown => {
  // nearcore returns empty string when there is no result data;
  // So for better readability, we return null instead of empty string;
  if (dataBase64 === '') return null;

  // Try our best - if we can parse the data as JSON, return the parsed result;
  // otherwise, return the raw base64 data;
  try {
    return fromJsonBytes(Uint8Array.fromBase64(dataBase64));
  } catch {
    return dataBase64;
  }
};

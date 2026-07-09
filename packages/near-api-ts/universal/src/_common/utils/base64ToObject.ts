import type { Base64String } from '../../../types/_common/common';
import { u8ToObject } from './common';

// TODO maybe we can return JsonValue instead of unknown
export const base64ToObject = (base64String: Base64String): unknown =>
  u8ToObject(Uint8Array.fromBase64(base64String));

// Try our best - if we can parse the data as JSON, return the parsed result;
// otherwise, return the input base64 data;
export const tryBase64ToObject = (base64String: Base64String): unknown => {
  if (base64String === '') return null;
  try {
    return base64ToObject(base64String);
  } catch {
    return base64String;
  }
};

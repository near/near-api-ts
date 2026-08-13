import type { Base64String } from '../../../../types/_common/common';

// TODO maybe we can return JsonValue instead of unknown
const convertU8ToObject = (bytes: Uint8Array | number[]): unknown => {
  const u8 = Array.isArray(bytes) ? new Uint8Array(bytes) : bytes;
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(u8));
};

// TODO maybe we can return JsonValue instead of unknown
export const convertBase64ToObject = (base64String: Base64String): unknown =>
  convertU8ToObject(Uint8Array.fromBase64(base64String));

// Try our best - if we can parse the data as JSON, return the parsed result;
// otherwise, return the input base64 data;
export const tryBase64ToObject = (base64String: Base64String): unknown => {
  if (base64String === '') return null;
  try {
    return convertBase64ToObject(base64String);
  } catch {
    return base64String;
  }
};

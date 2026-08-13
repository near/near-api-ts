// TODO maybe we can take JsonValue instead of unknown
export const convertObjectToU8 = (value: unknown): Uint8Array =>
  new TextEncoder().encode(JSON.stringify(value));

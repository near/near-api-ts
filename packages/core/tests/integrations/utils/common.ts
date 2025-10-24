export const log = (data: unknown) =>
  console.dir(data, { depth: null, customInspect: true });

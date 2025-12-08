import { result } from '@common/utils/result';
import { createNatError, NatError } from '@common/natError';

/**
 * We use it when we want to change the error kind, and return a new error with
 * the same context; It helps us to:
 *  1. Keep implementation details hidden
 *  2. Keep a public error kind string size minimalist
 *
 * Example:
 *
 * `Client.Transport.SendRequest.PreferredRpc.NotFound` ->
 * `Client.GetAccountInfo.PreferredRpc.NotFound`
 *
 * Instead of
 * `Client.GetAccountInfo.Client.Transport.SendRequest.PreferredRpc.NotFound`
 */
export const repackError = ({
  error,
  originPrefix,
  targetPrefix,
}: {
  error: NatError<any>; // TODO fix any!
  originPrefix: string;
  targetPrefix: string;
}) => {
  const newKind = `${targetPrefix}.${error.kind.slice(originPrefix.length + 1)}`;

  return result.err(
    createNatError({
      kind: newKind as any, // TODO fix any!
      context: error.context,
    }),
  );
};

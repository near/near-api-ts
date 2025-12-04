import type { CreateTransportArgs } from 'nat-types/client/transport';
import type { Result } from 'nat-types/_common/common';
import type { Client } from 'nat-types/client/client';
import type {
  InvalidArgsContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type CreateClientErrorVariant =
  | {
      kind: 'CreateClient.InvalidArgs';
      context: InvalidArgsContext;
    }
  | {
      kind: 'CreateClient.Unknown';
      context: UnknownErrorContext;
    };

export type CreateClientUnknownErrorKind = 'CreateClient.Unknown';

type CreateClientArgs = {
  transport: CreateTransportArgs;
};

type CreateClientError =
  | NatError<'CreateClient.InvalidArgs'>
  | NatError<'CreateClient.Unknown'>;

export type SafeCreateClient = (
  args: CreateClientArgs,
) => Promise<Result<Client, CreateClientError>>;

export type CreateClient = (args: CreateClientArgs) => Promise<Client>;

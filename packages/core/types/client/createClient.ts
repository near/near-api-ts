import type { CreateTransportArgs } from 'nat-types/client/transport/transport';
import type { Result } from 'nat-types/_common/common';
import type { Client } from 'nat-types/client/client';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type CreateClientErrorVariant =
  | {
      kind: 'CreateClient.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateClient.Internal';
      context: InternalErrorContext;
    };

export type CreateClientInternalErrorKind = 'CreateClient.Internal';

type CreateClientArgs = {
  transport: CreateTransportArgs;
};

type CreateClientError =
  | NatError<'CreateClient.Args.InvalidSchema'>
  | NatError<'CreateClient.Internal'>;

export type SafeCreateClient = (
  args: CreateClientArgs,
) => Promise<Result<Client, CreateClientError>>;

export type CreateClient = (args: CreateClientArgs) => Promise<Client>;

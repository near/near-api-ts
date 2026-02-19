import type { CreateTransportArgs } from './transport/transport';
import type { Result } from '../_common/common';
import type { Client } from './client';
import type {
  InvalidSchemaErrorContext,
  InternalErrorContext,
} from '../natError';
import type { NatError } from '../../src/_common/natError';

export interface CreateClientPublicErrorRegistry {
  'CreateClient.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateClient.Internal': InternalErrorContext;
}

// export type CreateClientErrorVariant =
//   | {
//       kind: 'CreateClient.Args.InvalidSchema';
//       context: InvalidSchemaErrorContext;
//     }
//   | {
//       kind: 'CreateClient.Internal';
//       context: InternalErrorContext;
//     };
//
// export type CreateClientInternalErrorKind = 'CreateClient.Internal';

type CreateClientArgs = {
  transport: CreateTransportArgs;
};

type CreateClientError =
  | NatError<'CreateClient.Args.InvalidSchema'>
  | NatError<'CreateClient.Internal'>;

export type SafeCreateClient = (
  args: CreateClientArgs,
) => Result<Client, CreateClientError>;

export type CreateClient = (args: CreateClientArgs) => Client;

import type { JsonValue, Base64String, AccountId, Result } from './common';
import type { Signature, PublicKey } from './crypto';
import type { InvalidSchemaErrorContext, InternalErrorContext } from './natError';
import type { NatError } from '../../src/_common/natError';
import type { SafeGetAccountAccessKeys, GetAccountAccessKeysError } from '../client/methods/account/getAccountAccessKeys';

export interface MessagePublicErrorRegistry {
  'CreateMessage.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMessage.Internal': InternalErrorContext;
  'VerifyMessage.Args.InvalidSchema': InvalidSchemaErrorContext;
  'VerifyMessage.AccessKeys.NotLoaded': { cause: GetAccountAccessKeysError };
  'VerifyMessage.Internal': InternalErrorContext;
}

export type Message = {
  message: string;
  recipient: string;
  nonce: Base64String;
};

export type SignedMessage = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  message: Message;
  signature: Signature;
};

// ------------------------------------------------------------------------------------------------
// Create Message

type CreateMessageArgs = {
  message: JsonValue;
  recipient: string;
  nonce?: Uint8Array;
};

type CreateMessageOutput = Message;

type CreateMessageError =
  | NatError<'CreateMessage.Args.InvalidSchema'>
  | NatError<'CreateMessage.Internal'>;

export type SafeCreateMessage = (
  args: CreateMessageArgs,
) => Result<CreateMessageOutput, CreateMessageError>;

export type CreateMessage = (args: CreateMessageArgs) => CreateMessageOutput;

// ------------------------------------------------------------------------------------------------
// Verify Message

type VerifyMessageArgs = {
  signedMessage: SignedMessage;
  message: Message;
  client: {
    safeGetAccountAccessKeys: SafeGetAccountAccessKeys;
  };
};

type VerifyMessageOutput = boolean;

type VerifyMessageError =
  | NatError<'VerifyMessage.Args.InvalidSchema'>
  | NatError<'VerifyMessage.AccessKeys.NotLoaded'>
  | NatError<'VerifyMessage.Internal'>;

export type SafeVerifyMessage = (
  args: VerifyMessageArgs,
) => Promise<Result<VerifyMessageOutput, VerifyMessageError>>;

export type VerifyMessage = (args: VerifyMessageArgs) => Promise<VerifyMessageOutput>;

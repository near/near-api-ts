import type { JsonValue, Base64String, AccountId, Result } from '@universal/types/_common/common';
import type { Signature, PublicKey } from '@universal/types/_common/crypto';
import type { InvalidSchemaErrorContext, InternalErrorContext } from '@universal/types/natError';
import type { NatError } from '@universal/src/_common/natError';
import type {
  SafeGetAccountAccessKeys,
  GetAccountAccessKeysError,
} from '@universal/types/client/methods/account/getAccountAccessKeys';

export interface MessagePublicErrorRegistry {
  'CreateMessage.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMessage.Internal': InternalErrorContext;
  'VerifyMessage.Args.InvalidSchema': InvalidSchemaErrorContext;
  'VerifyMessage.AccessKeys.NotLoaded': { cause: GetAccountAccessKeysError };
  'VerifyMessage.Internal': InternalErrorContext;
}

export type Message = {
  data: string;
  requester: string;
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
  data: JsonValue;
  requester: string;
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
  originMessage: Message;
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

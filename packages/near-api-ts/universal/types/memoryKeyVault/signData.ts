import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type {
  SafeSignData as CommonSafeSignData,
  SignDataArgs,
  SignedData,
} from '../_common/signData';

type SignDataError =
  | NatError<'MemoryKeyVault.SignData.Args.InvalidSchema'>
  | NatError<'MemoryKeyVault.SignData.SigningKey.NotFound'>
  | NatError<'MemoryKeyVault.SignData.Internal'>;

export type SafeSignData = CommonSafeSignData<SignDataError>;
export type SignData = (args: SignDataArgs) => Promise<SignedData>;

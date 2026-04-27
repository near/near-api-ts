import type { NatError } from '../../../src/_common/natError';
import type {
  SafeSignData as CommonSafeSignData,
  SignDataArgs,
  SignedData,
} from '../../_common/signData';

type SignDataError =
  | NatError<'MemoryKeyService.SignData.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.SignData.SigningKey.NotFound'>
  | NatError<'MemoryKeyService.SignData.Internal'>;

export type SafeSignData = CommonSafeSignData<SignDataError>;
export type SignData = (args: SignDataArgs) => Promise<SignedData>;

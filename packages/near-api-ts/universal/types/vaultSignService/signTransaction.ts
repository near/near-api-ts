import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { SignTransactionOutput } from '../_common/transaction/signTransaction';
import type { Transaction } from '../_common/transaction/transaction';
import type { HasKeyPairErrorOf, SignDataErrorOf, Vault } from '../_common/vault';

export type SignTransactionArgs = { transaction: Transaction };

type SignTransactionError<V extends Vault> =
  | NatError<'VaultSignService.SignTransaction.Args.InvalidSchema'>
  | NatError<'VaultSignService.SignTransaction.SigningKey.NotFound'>
  | NatError<
      'VaultSignService.SignTransaction.Vault.Failed',
      { cause: HasKeyPairErrorOf<V> | SignDataErrorOf<V> }
    >
  | NatError<'VaultSignService.SignTransaction.Internal'>;

export type SafeSignTransaction<V extends Vault> = (
  args: SignTransactionArgs,
) => Promise<Result<SignTransactionOutput, SignTransactionError<V>>>;

export type SignTransaction = (args: SignTransactionArgs) => Promise<SignTransactionOutput>;

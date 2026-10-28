import type { MemoryVault, Vault } from '../../../index';
import type { KeyPair } from '../../../types/_common/keyPairs/keyPair';

type Expect<T extends true> = T;
type Extends<A, B> = [A] extends [B] ? true : false;

// A sign service takes a memory vault as a vault
type _MemoryVaultIsVault = Expect<Extends<MemoryVault, Vault>>;

// A key pair signs data, but can't say which keys it holds, so it isn't one
type _KeyPairIsNotVault = Expect<Extends<Extends<KeyPair, Vault>, false>>;

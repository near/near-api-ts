import type { FileKeyServicePublicErrorRegister } from './fileKeyService/fileKeyService';

declare module '../../universal/types/_common/natError' {
  interface NatPublicErrorRegistry extends FileKeyServicePublicErrorRegister {}
}

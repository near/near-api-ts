import type { FileKeyServicePublicErrorRegister } from './fileKeyService/fileKeyService';

declare module '@universal/types/natError' {
  interface NatPublicErrorRegistry extends FileKeyServicePublicErrorRegister {}
}

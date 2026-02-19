import type { IdbKeyServicePublicErrorRegister } from './idbKeyService/idbKeyService';

declare module '@universal/types/natError' {
  interface NatPublicErrorRegistry extends IdbKeyServicePublicErrorRegister {}
}

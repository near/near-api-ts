import type { IdbKeyServicePublicErrorRegister } from './idbKeyService/idbKeyService';

declare module '@universal/types/_common/natError' {
  interface NatPublicErrorRegistry extends IdbKeyServicePublicErrorRegister {}
}

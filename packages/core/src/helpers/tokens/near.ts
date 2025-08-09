import { convertTokensToUnits } from '@common/utils/tokenConverter/convertTokensToUnits';
import { convertUnitsToTokens } from '@common/utils/tokenConverter/convertUnitsToTokens';
import { NearDecimals } from '@common/configs/constants';
import type { Units, Tokens, NearAmount, NearToken } from 'nat-types/common';

export const yoctoNear = (units: Units): NearToken => {
  // TODO validate units
  return {
    yoctoNear: BigInt(units),
    near: convertUnitsToTokens(units, NearDecimals),
  };
};

export const near = (tokens: Tokens): NearToken => {
  // TODO validate tokens
  return {
    yoctoNear: BigInt(convertTokensToUnits(tokens, NearDecimals)),
    near: tokens,
  };
};

export const nearAmount = (nearAmount: NearAmount): NearToken => {
  if ('yoctoNear' in nearAmount) return yoctoNear(nearAmount.yoctoNear);
  if ('near' in nearAmount) return near(nearAmount.near);
  throw new Error('Invalid nearAmount format');
};

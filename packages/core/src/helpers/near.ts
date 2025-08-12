import { convertTokensToUnits } from '@common/utils/tokenConverter/convertTokensToUnits';
import { convertUnitsToTokens } from '@common/utils/tokenConverter/convertUnitsToTokens';
import { NearDecimals } from '@common/configs/constants';
import type { Units, Tokens, NearOption, NearToken } from 'nat-types/common';

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

export const fromNearOption = (nearOption: NearOption): NearToken => {
  if ('yoctoNear' in nearOption) return yoctoNear(nearOption.yoctoNear);
  if ('near' in nearOption) return near(nearOption.near);
  throw new Error('Invalid nearAmount format');
};

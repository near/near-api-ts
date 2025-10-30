import type {
  NearGas,
  NearGasArgs,
  GasInputAmount,
  TeraGasInputAmount,
} from 'nat-types/common';

const TeraCoefficient = 10n ** 12n;

export const gas = (gas: GasInputAmount) => {
  // TODO Validate
  return {
    gas: BigInt(gas),
    teraGas: String(BigInt(gas) / TeraCoefficient), // We don't keep decimals here
  };
};

export const teraGas = (teraGas: TeraGasInputAmount) => {
  // TODO Validate
  return {
    gas: BigInt(teraGas) * TeraCoefficient,
    teraGas,
  };
};

export const fromGasOption = (nearGasArgs: NearGasArgs): NearGas => {
  if ('teraGas' in nearGasArgs) return teraGas(nearGasArgs.teraGas);
  if ('gas' in nearGasArgs) return gas(nearGasArgs.gas);
  throw new Error('Invalid gas option');
};

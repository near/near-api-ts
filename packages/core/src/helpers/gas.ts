import type { GasLimit, GasOption, GasInput, TeraGasInput } from 'nat-types/common';

const TeraCoefficient = 10n ** 12n;

export const gas = (gas: GasInput) => {
  // TODO Validate
  return {
    gas: BigInt(gas),
    teraGas: String(BigInt(gas) / TeraCoefficient), // We don't keep decimals here
  };
};

export const teraGas = (teraGas: TeraGasInput) => {
  // TODO Validate
  return {
    gas: BigInt(teraGas) * TeraCoefficient,
    teraGas,
  };
};

export const fromGasOption = (gasOption: GasOption): GasLimit => {
  if ('teraGas' in gasOption) return teraGas(gasOption.teraGas);
  if ('gas' in gasOption) return gas(gasOption.gas);
  throw new Error('Invalid gas option');
};

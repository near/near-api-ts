import type { GasLimit, GasOption, Gas, TeraGas } from 'nat-types/common';

const TeraCoefficient = 10n ** 12n;

export const gas = (gas: Gas) => {
  // TODO Validate
  return {
    gas,
    teraGas: gas / TeraCoefficient, // We don't keep decimals here
  };
};

export const teraGas = (teraGas: TeraGas) => {
  // TODO Validate
  return {
    gas: teraGas * TeraCoefficient,
    teraGas,
  };
};

export const fromGasOption = (gasOption: GasOption): GasLimit => {
  if ('teraGas' in gasOption) return teraGas(gasOption.teraGas);
  if ('gas' in gasOption) return gas(gasOption.gas);
  throw new Error('Invalid gas option');
};

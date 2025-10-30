export type GasInputAmount = bigint | number;
export type TeraGasInputAmount = string;

export type NearGasArgs =
  | { gas: GasInputAmount }
  | { teraGas: TeraGasInputAmount };

export type Gas = bigint;
export type TeraGas = string;

export type NearGas = Readonly<{
  gas: Gas;
  teraGas: TeraGas;
  add: (value: NearGasArgs | NearGas) => NearGas;
  sub: (value: NearGasArgs | NearGas) => NearGas;
  mul: (value: NearGasArgs | NearGas) => NearGas;
  gt: (value: NearGasArgs | NearGas) => boolean;
  lt: (value: NearGasArgs | NearGas) => boolean;
}>;

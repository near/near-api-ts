import type { Base64String } from 'nat-types/_common/common';

type WasmBase64 = { wasmBase64: Base64String; wasmBytes?: never };
type WasmBytes = { wasmBase64?: never; wasmBytes: Uint8Array };

export type CreateDeployContractActionArgs = WasmBase64 | WasmBytes;

export type DeployContractAction = {
  actionType: 'DeployContract';
} & CreateDeployContractActionArgs;

// ****** NATIVE ********

export type NativeDeployContractAction = {
  deployContract: {
    code: Uint8Array;
  };
};

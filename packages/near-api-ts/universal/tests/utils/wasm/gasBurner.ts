/**
 * The smallest contract that burns every bit of gas attached to a call:
 *
 * ```wat
 * (module
 *   (func (export "burn") (loop $l (br $l))))
 * ```
 *
 * The gas metering nearcore injects into the loop ends the call with
 * `GasLimitExceeded`, so the receipt always burns its full prepaid gas. Hand-assembled
 * rather than compiled, because 39 bytes of wasm need no toolchain and no build step.
 */
export const GAS_BURNER_WASM = new Uint8Array([
  // magic + version
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  // type section: one `() -> ()` signature
  0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
  // function section: function 0 uses signature 0
  0x03, 0x02, 0x01, 0x00,
  // export section: "burn" -> function 0
  0x07, 0x08, 0x01, 0x04, 0x62, 0x75, 0x72, 0x6e, 0x00, 0x00,
  // code section: no locals, `loop { br 0 }`
  0x0a, 0x09, 0x01, 0x07, 0x00, 0x03, 0x40, 0x0c, 0x00, 0x0b, 0x0b,
]);

export const GAS_BURNER_FUNCTION_NAME = 'burn';

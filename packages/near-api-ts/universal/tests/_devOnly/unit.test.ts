import { it } from 'vitest';
import { executeDelegation } from '../../index';
import { log } from '../utils/common';

it('unit test', () => {
  log(
    executeDelegation({
      signedDelegationBorsh64:
        'EQAAAGxhbnRzdG9vbC50ZXN0bmV0HwAAAHJlYWN0LW5lYXItdHMubGFudHN0b29sLnRlc3RuZXQBAAAACgEEAAAAbmVhchI0xCA8rgAAHrrsDwAAAAAAzf8tAQyE/vPny9y27Sfzv3Vu0QzH+22QpoNxItAhWZ8AskbY/6G+/i1FLYeVzsLju6RIYziIIBgHQ6H6AgHYqulCJrROlnxOHF+A/tsQtbwYB24zgVYh8K0m13AjcnEVAg==',
    }),
  );
});

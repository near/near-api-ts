import { it } from 'vitest';
import { executeDelegation } from '../../index';
import { log } from '../utils/common';

it('unit test', () => {
  log(
    executeDelegation({
      signedDelegationBorsh64:
        'EQAAAGVjbGlwc2Vlci50ZXN0bmV0HwAAAHJlYWN0LW5lYXItdHMubGFudHN0b29sLnRlc3RuZXQBAAAAAgoAAABhZGRfcmVjb3JkEAAAAHsicmVjb3JkIjoiMTIzIn0AoHJOGAkAAAAAAAAAAAAAAAAAAAAAAAAoiSoxZJAAADmi2A8AAAAAAFCo04xswi9H9mu+1Qe4czM3Fe/HnQ2hUZsmfuSntAsnANNsqRfiUdWyOaX1xd2zdJFCOTZCc3zI5cqoTXOIoPFIR1KDJfZVmaY9mcdWYhbBZNNsRKUv8bZ/K8Q5bCAu8AM=',
    }),
  );
});

import type { Foo } from '../packages/types/src';
import { logFoo } from '../packages/core/src';

const a: Foo = {
  id: '',
  value: 0,
  x: 0,
  // y: 0
};
console.log(a);

logFoo(a);

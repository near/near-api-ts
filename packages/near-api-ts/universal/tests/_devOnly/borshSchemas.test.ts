import { serialize } from 'borsh';
import { test } from 'vitest';

const TestSchema = {
  struct: {
    allowance: { option: 'u128' },
    receiverId: 'string',
    methodNames: { array: { type: 'string' } },
  },
};

test('test', () => {
  const res = serialize(TestSchema, {
    receiverId: 'test',
    methodNames: ['test'],
  });
  console.log(res);
});

/*
[
    0,   4, 0,   0,   0, 116, 101,
  115, 116, 1,   0,   0,   0,   4,
    0,   0, 0, 116, 101, 115, 116
]

[
    0,   4, 0,   0,   0, 116, 101,
  115, 116, 1,   0,   0,   0,   4,
    0,   0, 0, 116, 101, 115, 116
]
 */

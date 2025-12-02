import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { describe, it } from 'vitest';
import * as z from 'zod/mini';


// import { en } from 'zod/locales';
// z.config(en());

const testSchema = z.object({
  accountId: AccountIdSchema,
  // blockId: z.union([z.string(), z.uint64()]),
  // x: z.uint64(),
  // nested: z.object({
  //   accountId: z.string(),
  // })
});

describe('AccountId', () => {
  it('Ok', () => {
    // const res = AccountIdSchema.safeParse('1233#')
    const res = testSchema.safeParse({
      accountId: '12-1.',
      blockId: 5,
      x: 1,
      nested: {
        x: 1
      }
    });

    if (!res.success) {
      console.log(z.prettifyError(res.error));
      console.log(res.error);
    }
  });
});

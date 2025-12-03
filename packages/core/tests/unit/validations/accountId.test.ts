import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { describe, it } from 'vitest';
import * as z from 'zod/mini';

const testSchema = z.object({
  accountId: AccountIdSchema,
});

describe('AccountId', () => {
  it('Ok', () => {
    const res = testSchema.safeParse({
      accountId: '12-1.',
    });

    if (!res.success) {
      console.log(z.prettifyError(res.error));
      console.log(res.error);
    }
  });
});

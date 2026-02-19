import { describe, it } from 'vitest';
import * as z from 'zod/mini';
import { AccountIdSchema } from '../../../src/_common/schemas/zod/common/accountId';

z.config(z.locales.en());

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

import * as z from 'zod/mini';

// No upper bound on the length: `max_length_method_name` lives in the protocol config and can
// change, so the node is left to be the one that rejects an over-long name.
export const ContractFunctionNameZodSchema = z.string().check(z.minLength(1));

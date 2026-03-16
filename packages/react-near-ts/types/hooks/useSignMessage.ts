import type { UseMutationResult } from '@tanstack/react-query';
import type { SignMessageArgs, SignMessageOutput } from '../services/_common.ts';

export type UseSignMessage = () => UseMutationResult<
  SignMessageOutput,
  Error,
  SignMessageArgs,
  unknown
>;

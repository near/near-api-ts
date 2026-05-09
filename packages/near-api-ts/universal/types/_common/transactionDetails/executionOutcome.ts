export type ExecutionOutcome =
  | {
      status: 'Success';
      data: unknown;
    }
  | {
      status: 'Error';
      error: unknown;
    };

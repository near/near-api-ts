import type { TransactionIntent } from 'nat-types/transaction';

export const getKeyPriority = ({
  action,
  actions,
  receiverAccountId,
}: TransactionIntent) => {
  if (action?.type === 'FunctionCall') {
    // TODO implement
    // minGasBudget
  }

  return ['FullAccess']
};

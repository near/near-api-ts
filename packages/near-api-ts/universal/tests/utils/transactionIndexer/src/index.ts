import { loadTransactionsWithErrors } from './loadFailedTransactions/loadTransactionsWithErrors';
import { getDateRange } from './utils/getDateRange';

await loadTransactionsWithErrors(getDateRange('2022-01-02', '2022-01-31'));


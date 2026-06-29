import { loadTransactionsWithErrors } from './loadFailedTransactions/loadTransactionsWithErrors';
import { getDateRange } from './utils/getDateRange';

await loadTransactionsWithErrors(getDateRange('2020-11-16', '2021-03-01'));

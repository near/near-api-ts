import { loadTransactionsWithErrors } from './loadFailedTransactions/loadTransactionsWithErrors';
import { getDateRange } from './utils/getDateRange';

await loadTransactionsWithErrors(getDateRange('2020-10-12', '2021-10-13'));

import { it } from 'vitest';
import { processingStageToFinalExecutionStatus } from '../../src/createClient/methods/transaction/_common/processingStageConverters';
import { log } from '../utils/common';

it('unit test', () => {
  log(processingStageToFinalExecutionStatus('ConvertedOptimistic'));
});

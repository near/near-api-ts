import {
  type DeserializeResultFnArgs,
  fromJsonBytes,
  useConnectedAccount,
  useContractReadFunction,
} from 'react-near-ts';
import * as z from 'zod/mini';
import { ContractAccountId } from './config';

const ResultSchema = z.array(z.string());

const deserializeResult = (args: DeserializeResultFnArgs) =>
  ResultSchema.parse(fromJsonBytes(args.rawResult));

export const useReadRecords = () => {
  const { connectedAccountId, isConnectedAccount } = useConnectedAccount();

  return useContractReadFunction({
    contractAccountId: ContractAccountId,
    functionName: 'get_records',
    functionArgs: { author_id: connectedAccountId ?? '' },
    withStateAt: 'LatestOptimisticBlock',
    options: {
      deserializeResult,
    },
    query: {
      enabled: isConnectedAccount,
    },
  });
};

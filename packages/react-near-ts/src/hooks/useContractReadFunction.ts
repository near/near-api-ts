import { useQuery, skipToken } from '@tanstack/react-query';
import type {
  InnerUseContractReadFunctionArgs,
  UseContractReadFunction,
} from '../../types/hooks/useContractReadFunction.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

export const useContractReadFunction: UseContractReadFunction = (
  args: InnerUseContractReadFunctionArgs,
): ReturnType<UseContractReadFunction> => {
  const getContext = useNearStore((store) => store.getContext);
  const context = getContext();

  const { query, contractAccountId, functionName, ...rest } = args;

  return useQuery({
    queryKey: ['callContractReadFunction', contractAccountId, functionName, rest.functionArgs],
    queryFn:
      contractAccountId && functionName
        ? ({ signal }) =>
            context.client.callContractReadFunction({
              ...rest,
              contractAccountId,
              functionName,
              options: {
                ...rest.options,
                signal,
              },
            })
        : skipToken,
    enabled: query?.enabled ?? true,
  });
};

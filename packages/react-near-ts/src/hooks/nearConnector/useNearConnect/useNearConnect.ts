import { useNearStore } from '../../../store/NearStoreProvider.tsx';
import type { UseNearConnect, InnerUseNearConnectArgs } from '../../../../types/hooks/nearConnector/useNearConnect.ts';
import { useWithoutAdditionalAction } from './useWithoutAdditionalAction.ts';
import { useWithSignMessage } from './useWithSignMessage.ts';

export const useNearConnect = ((args: InnerUseNearConnectArgs) => {
  const getContext = useNearStore((store) => store.getContext);
  const setSigners = useNearStore((store) => store.setSigners);
  const setConnectedAccountId = useNearStore((store) => store.setConnectedAccountId);
  const context = getContext();

  if (!args?.additionalAction)
    return useWithoutAdditionalAction(args, context, setSigners, setConnectedAccountId);

  if (args.additionalAction === 'SignMessage')
    return useWithSignMessage(args, context, setSigners, setConnectedAccountId);
}) as UseNearConnect;

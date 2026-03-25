import type {
  InnerUseNearConnectArgs,
  UseNearConnect,
} from '../../../../types/hooks/nearConnector/useNearConnect/useNearConnect.ts';
import { useNearStore } from '../../../store/NearStoreProvider.tsx';
import { withAddFunctionCallKey } from './withAddFunctionCallKey.ts';
import { withoutAdditionalAction } from './withoutAdditionalAction.ts';
import { withSignMessage } from './withSignMessage.ts';

export const useNearConnect = ((args?: InnerUseNearConnectArgs) => {
  const getContext = useNearStore((store) => store.getContext);
  const setSigners = useNearStore((store) => store.setSigners);
  const setConnectedAccountId = useNearStore((store) => store.setConnectedAccountId);
  const context = getContext();

  if (args?.additionalAction === 'SignMessage')
    return withSignMessage(args, context, setSigners, setConnectedAccountId);

  if (args?.additionalAction === 'AddFunctionCallKey')
    return withAddFunctionCallKey(args, context, setSigners, setConnectedAccountId);

  return withoutAdditionalAction(context, setSigners, setConnectedAccountId, args);
}) as UseNearConnect;

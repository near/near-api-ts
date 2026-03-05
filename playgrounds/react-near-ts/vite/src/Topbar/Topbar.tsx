import { Button, Title } from '@mantine/core';
import { useConnectedAccount, useNearConnector } from 'react-near-ts';
import cn from './Topbar.module.css';

export const Topbar = () => {
  const { connectedAccountId, isConnectedAccount } = useConnectedAccount();
  const { connect, disconnect } = useNearConnector();

  return (
    <div className={cn.topbar}>
      <Title order={3}>React Near TS</Title>
      <div className={cn.leftSide}>
        {isConnectedAccount ? (
          <>
            <p>{connectedAccountId}</p>
            <Button onClick={disconnect}>Disconnect</Button>
          </>
        ) : (
          <Button onClick={connect}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
};

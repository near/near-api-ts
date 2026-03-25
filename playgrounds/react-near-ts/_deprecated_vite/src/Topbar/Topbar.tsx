import { Button, Title } from '@mantine/core';
import { useConnectedAccount, useNearSignIn, useNearSignOut } from 'react-near-ts';
import cn from './Topbar.module.css';

export const Topbar = () => {
  const { connectedAccountId, isConnectedAccount } = useConnectedAccount();
  const { signIn } = useNearSignIn();
  const { signOut } = useNearSignOut();

  return (
    <div className={cn.topbar}>
      <Title order={3}>React Near TS</Title>
      <div className={cn.leftSide}>
        {isConnectedAccount ? (
          <>
            <p>{connectedAccountId}</p>
            <Button onClick={() => signOut()}>Disconnect</Button>
          </>
        ) : (
          <Button onClick={() => signIn()}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
};

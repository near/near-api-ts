import { Text, Title } from '@mantine/core';
import { useAccountInfo, useConnectedAccount } from 'react-near-ts';
import cn from './ConnectedAccount.module.css';

export const ConnectedAccount = () => {
  const { connectedAccountId } = useConnectedAccount();
  const accountInfo = useAccountInfo({ accountId: connectedAccountId });

  if (accountInfo.isPending) return <Text>Waiting for connected account...</Text>;

  if (accountInfo.isError) return <Text>Error during loading the account info...</Text>;

  const { balance, usedStorageBytes } = accountInfo.data.accountInfo;

  return (
    <>
      <Title order={3}>Connected Account</Title>
      <div className={cn.info}>
        <div className={cn.row}>
          <Text>Account ID</Text>
          <Text>{accountInfo.data.accountId}</Text>
        </div>
        <div className={cn.row}>
          <Text>Total Balance</Text>
          <Text>{balance.total.near} NEAR</Text>
        </div>
        <div className={cn.row}>
          <Text>Available Balance</Text>
          <Text>{balance.available.near} NEAR</Text>
        </div>
        <div className={cn.row}>
          <Text>Storage Usage</Text>
          <Text>{usedStorageBytes} bytes</Text>
        </div>
      </div>
    </>
  );
};

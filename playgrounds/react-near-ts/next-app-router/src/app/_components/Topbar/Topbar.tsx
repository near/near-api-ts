'use client';

import { Grid, Paper, Text, Title } from '@mantine/core';
import { useConnectedAccount } from 'react-near-ts';
import { ConnectedAccount } from '@/app/_components/Topbar/ConnectedAccount/ConnectedAccount.tsx';
import { SignIn } from '@/app/_components/Topbar/SignIn/SignIn.tsx';
import styles from './Topbar.module.css';

export const Topbar = () => {
  const { connectedAccountId, isConnectedAccount } = useConnectedAccount();

  return (
    <Paper className={styles.header} radius="md" p="lg" withBorder>
      <Grid>
        <Grid.Col span={6}>
          <Text className={styles.kicker}>React-Near-TS</Text>
          <Title order={2} className={styles.title}>
            Next.js Playground
          </Title>
          <Text className={styles.subtitle}>
            Explore account info, token transfers, and contract records.
          </Text>
        </Grid.Col>
        <Grid.Col
          span={6}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {isConnectedAccount ? (
            <ConnectedAccount connectedAccountId={connectedAccountId} />
          ) : (
            <SignIn />
          )}
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

'use client';

import { Badge, Button, Group, Menu, Paper, Text, Title, Grid } from '@mantine/core';
import {
  useConnectedAccount,
  useNearConnect,
  useNearDisconnect,
  randomEd25519KeyPair,
} from 'react-near-ts';
import styles from './Topbar.module.css';

export const Topbar = () => {
  const { connectedAccountId, isConnectedAccount } = useConnectedAccount();
  const { connect } = useNearConnect({ additionalAction: 'AddFunctionCallKey' });
  const { disconnect } = useNearDisconnect();

  const connectWallet = async () => {
    connect({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'testnet',
      gasBudget: { near: '1000' },
      allowedFunctions: 'AllNonPayable',
    });
  };

  // const connectWallet = async () => {
  //   const res = await connectAsync({
  //     message: createMessage({ message: '123', recipient: 'test' }),
  //   });
  //   console.log('Connect + signedMessage: ', res);
  // };

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
            <Menu position="bottom-end" width={150} withinPortal>
              <Menu.Target>
                <Paper radius="md" withBorder>
                  <Group style={{ padding: '6px', gap: '6px', cursor: 'pointer' }}>
                    <Badge color="teal" variant="light" radius="sm" style={{ cursor: 'pointer' }}>
                      {connectedAccountId}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      ▾
                    </Text>
                  </Group>
                </Paper>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => disconnect()}>Disconnect</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button size="sm" radius="md" onClick={connectWallet} color="#12b886">
              Connect Wallet
            </Button>
          )}
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

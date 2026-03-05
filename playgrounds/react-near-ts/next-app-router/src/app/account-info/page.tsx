'use client';

import {
  Card,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  Space,
} from '@mantine/core';
import { useAccountInfo, useConnectedAccount } from 'react-near-ts';

const AccountInfo = () => {
  const { connectedAccountId, isConnectedAccount } = useConnectedAccount();
  const accountInfo = useAccountInfo({ accountId: connectedAccountId });

  if (!isConnectedAccount) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Stack gap="xs">
          <Title order={3}>Account Info</Title>
          <Text c="dimmed">
            Connect your wallet to see balances and storage usage.
          </Text>
        </Stack>
      </Card>
    );
  }

  if (accountInfo.isPending) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Group gap="sm">
          <Loader size="sm" />
          <Text c="dimmed">Loading account details...</Text>
        </Group>
      </Card>
    );
  }

  if (accountInfo.isError) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Text c="red">Failed to load account info.</Text>
      </Card>
    );
  }

  const { balance, usedStorageBytes } = accountInfo.data.accountInfo;

  return (
    <Card padding="xl" radius="md" withBorder>
      <Stack gap="sm">
        <Stack style={{ gap: '2px' }}>
          <Title order={3}>Account Info</Title>
          <Text size="sm" c="dimmed">
            General account info such as balance, storage usage, and more.
          </Text>
        </Stack>

        <Space />

        <Paper radius="md" p="xs" withBorder>
          <Text size="xs" c="dimmed">
            Account ID
          </Text>
          <Text fw={500}>{accountInfo.data.accountId}</Text>
        </Paper>

        <Paper radius="md" p="xs" withBorder>
          <Text size="xs" c="dimmed">
            Storage Used
          </Text>
          <Text fw={500}>{usedStorageBytes} bytes</Text>
        </Paper>

        <Paper radius="md" p="xs" withBorder>
          <Text size="xs" c="dimmed">
            Total Balance
          </Text>
          <Text fw={500}>{balance.total.near} NEAR</Text>
        </Paper>

        <Paper radius="md" p="xs" withBorder>
          <Text size="xs" c="dimmed">
            Available Balance
          </Text>
          <Text fw={500}>{balance.available.near} NEAR</Text>
        </Paper>

        <Paper radius="md" p="xs" withBorder>
          <Text size="xs" c="dimmed">
            Locked Balance
          </Text>
          <Text fw={500}>{balance.locked.amount.near} NEAR</Text>
        </Paper>
      </Stack>
    </Card>
  );
};

export default AccountInfo;

'use client';

import {
  Button,
  Card,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import {
  transfer,
  useConnectedAccount,
  useExecuteTransaction,
} from 'react-near-ts';
import styles from './page.module.css';

const SendNear = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const executeTransaction = useExecuteTransaction();
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'near' | 'yoctoNear'>('near');
  const [receiverAccountId, setReceiverAccountId] = useState('');

  const sendTokens = () => {
    const tokens = unit === 'near' ? { near: amount } : { yoctoNear: amount };

    executeTransaction.mutate({
      intent: {
        action: transfer({ amount: tokens }),
        receiverAccountId: receiverAccountId.trim(),
      },
    });
  };

  if (!isConnectedAccount) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Stack gap="xs">
          <Title order={3}>Send Tokens</Title>
          <Text c="dimmed">Connect your wallet to send NEAR tokens.</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding="xl" radius="md" withBorder>
      <Stack gap="md">
        <Stack style={{ gap: '2px' }}>
          <Title order={3}>Send Tokens</Title>
          <Text size="sm" c="dimmed">
            Transfer NEAR or yoctoNEAR in one transaction.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Group align="flex-end" grow>
            <TextInput
              label="Amount"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.currentTarget.value)}
            />
            <SegmentedControl
              data={[
                { label: 'NEAR', value: 'near' },
                { label: 'yoctoNEAR', value: 'yoctoNear' },
              ]}
              value={unit}
              onChange={(value) => setUnit(value as 'near' | 'yoctoNear')}
            />
          </Group>
          <TextInput
            label="Receiver"
            placeholder="receiver.testnet"
            value={receiverAccountId}
            onChange={(event) =>
              setReceiverAccountId(event.currentTarget.value)
            }
          />
        </Stack>

        <Group justify="flex-end">
          <Button
            radius="md"
            color="#12b886"
            onClick={sendTokens}
            disabled={!isConnectedAccount}
            loading={executeTransaction.isPending}
          >
            Send Tokens
          </Button>
        </Group>

        {executeTransaction.isSuccess && (
          <Paper radius="md" p="md" className={styles.success}>
            <Text size="sm">Transaction executed successfully.</Text>
            <Text size="xs" c="dimmed">
              Hash: {executeTransaction.data.rawRpcResult.transaction.hash}
            </Text>
          </Paper>
        )}

        {executeTransaction.isError && (
          <Paper radius="md" p="md" className={styles.error}>
            <Text size="sm">{executeTransaction.error.message}</Text>
          </Paper>
        )}
      </Stack>
    </Card>
  );
};

export default SendNear;

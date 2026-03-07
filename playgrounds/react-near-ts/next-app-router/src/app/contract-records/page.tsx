'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { useConnectedAccount } from 'react-near-ts';
import styles from '../_components/Topbar/Topbar.module.css';
import { useAddRecord } from './useAddRecord';
import { useReadRecords } from './useReadRecords';
import { useRemoveRecord } from './useRemoveRecord';

const ContractRecords = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const [recordInput, setRecordInput] = useState('');
  const records = useReadRecords();
  const { addRecord, addRecordMutation } = useAddRecord(setRecordInput);
  const { removeRecord, removeRecordMutation } = useRemoveRecord();

  if (!isConnectedAccount) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Stack gap="xs">
          <Title order={3}>Contract Records</Title>
          <Text c="dimmed">Connect your wallet to see your records.</Text>
        </Stack>
      </Card>
    );
  }

  if (records.isPending)
    return (
      <Group gap="sm">
        <Loader size="sm" />
        <Text c="dimmed">Loading records...</Text>
      </Group>
    );

  if (records.isError) return <Text c="red">Failed to load contract records.</Text>;

  return (
    <Card padding="xl" radius="lg" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Stack style={{ gap: '2px' }}>
            <Title order={3}>Contract Records</Title>
            <Text size="sm" c="dimmed">
              Reading from react-near-ts.lantstool.testnet
            </Text>
          </Stack>
          <Badge variant="light" color="teal">
            {records.data.result.length}
          </Badge>
        </Group>

        <Stack gap="xs">
          {records.data.result.map((record, index) => (
            <Paper key={`${record}-${index}`} p="sm" radius="md" withBorder>
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Badge color="gray">{index + 1}</Badge>
                  <Text> {record}</Text>
                </Group>
                {isConnectedAccount && (
                  <ActionIcon color="red" variant="light" onClick={() => removeRecord(index)}>
                    ×
                  </ActionIcon>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>

        {isConnectedAccount ? (
          <Group align="flex-end">
            <TextInput
              label="New record"
              placeholder="Enter record text"
              value={recordInput}
              onChange={(event) => setRecordInput(event.currentTarget.value)}
              className={styles.recordInput}
            />
            <Button
              radius="md"
              color="#12b886"
              onClick={() => addRecord(recordInput)}
              disabled={!recordInput.trim()}
              loading={addRecordMutation.isPending}
            >
              Add Record
            </Button>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Connect your wallet to add or remove records.
          </Text>
        )}

        {addRecordMutation.isError && (
          <Text size="sm" c="red">
            {addRecordMutation.error.message}
          </Text>
        )}

        {removeRecordMutation.isError && (
          <Text size="sm" c="red">
            {removeRecordMutation.error.message}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default ContractRecords;

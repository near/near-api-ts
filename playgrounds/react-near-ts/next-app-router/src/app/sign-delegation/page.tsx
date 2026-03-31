'use client';

import { Button, Card, Code, Group, Space, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useConnectedAccount } from 'react-near-ts';
import styles from '@/app/_components/Topbar/Topbar.module.css';
import { useSignAddRecordDelegation } from '@/app/sign-delegation/useSignAddRecordDelegation.ts';

const SignDelegateAction = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const [recordInput, setRecordInput] = useState('');
  const { signAddRecordDelegation, signAddRecordDelegationMutation } =
    useSignAddRecordDelegation(setRecordInput);

  return (
    <Card padding="xl" radius="md" withBorder>
      <Stack gap="md">
        <Stack style={{ gap: '2px' }}>
          <Title order={3}>Sign Delegation</Title>
          <Text size="sm" c="dimmed">
            Sign delegation and ask someone to pay gas fees for you.
          </Text>
        </Stack>
        {isConnectedAccount ? (
          <>
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
                onClick={() => signAddRecordDelegation(recordInput)}
                disabled={!recordInput.trim()}
                loading={signAddRecordDelegationMutation.isPending}
              >
                Sign Delegation
              </Button>
            </Group>

            {signAddRecordDelegationMutation.isSuccess && (
              <Stack>
                <Space />
                <Text size="sm" c="green">
                  Delegation signed successfully! Copy Borsh64 signed delegation
                </Text>
                <Code
                  styles={{
                    root: {
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    },
                  }}
                >
                  {signAddRecordDelegationMutation.data.borsh64SignedDelegation}
                </Code>
              </Stack>
            )}
          </>
        ) : (
          <Text c="dimmed">Connect your wallet to sign "Add Record" delegation.</Text>
        )}
      </Stack>
    </Card>
  );
};

export default SignDelegateAction;

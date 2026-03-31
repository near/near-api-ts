'use client';

import { Button, Card, Stack, Text, Title } from '@mantine/core';
import { transfer, useConnectedAccount, useSignDelegation } from 'react-near-ts';

const SignDelegateAction = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const { signDelegationAsync } = useSignDelegation();

  const signDelegateAction = async () => {
    const signedDelegation = await signDelegationAsync({
      intent: {
        action: transfer({ amount: { near: '0.129' } }),
        receiverAccountId: 'eclipseer.testnet',
        expiration: { blockOffset: 100 },
      },
    });
    console.log('Signed Delegation:', signedDelegation);
  };

  if (!isConnectedAccount) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Stack gap="xs">
          <Title order={3}>Sign Delegation</Title>
          <Text c="dimmed">Connect your wallet.</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding="xl" radius="md" withBorder>
      <Title order={3}>Sign Delegation</Title>
      <Button radius="md" color="#12b886" onClick={signDelegateAction}>
        Sign Delegate Action
      </Button>
    </Card>
  );
};

export default SignDelegateAction;

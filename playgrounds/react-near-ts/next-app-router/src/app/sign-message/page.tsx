'use client';

import { Card, Button, Stack, Text, Title, Space } from '@mantine/core';
import { useConnectedAccount, useSignMessage } from 'react-near-ts';

const SignMessage = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const signMessage = useSignMessage();

  // if (!isConnectedAccount) {
  //   return (
  //     <Card padding="xl" radius="md" withBorder>
  //       <Stack gap="xs">
  //         <Title order={3}>Account Info</Title>
  //         <Text c="dimmed">Connect your wallet to see balances and storage usage.</Text>
  //       </Stack>
  //     </Card>
  //   );
  // }

  const signMessageMutate = () =>
    signMessage.mutate({
      message: {
        data: 'Login',
        recipient: 'abc',
        nonce: new Uint8Array(32).fill(0),
      },
    });

  return (
    <Card padding="xl" radius="md" withBorder>
      <Title order={3}>Sign Message</Title>
      <Button radius="md" color="#12b886" onClick={signMessageMutate}>
        Sign Message
      </Button>
    </Card>
  );
};

export default SignMessage;

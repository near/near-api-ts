'use client';

import { Button, Card, Stack, Text, Title } from '@mantine/core';
import {
  createMessage,
  createTestnetClient,
  useConnectedAccount,
  useSignMessage,
  verifyMessage,
} from 'react-near-ts';

/*
{
  signerAccountId: 'eclipseer.testnet',
  signerPublicKey: 'ed25519:6RrvkTQKSo1DwW23rv3TWLhZZw5jySeW1AEVrLSfAhka',
  message: {
    message: 'Login',
    recipient: 'abc',
    nonce: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
  },
  signature: 'ed25519:2nMMjTCcptnHifxT5vT3QNdBXTx3No7iVYo4MiEJS6moSEf1coEtPUNhyR1DStccN7r2fpZhuxNT8hzpi9zrL56j'
}
 */

const SignMessage = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const { signMessageAsync } = useSignMessage();

  if (!isConnectedAccount) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Stack gap="xs">
          <Title order={3}>Account Info</Title>
          <Text c="dimmed">Connect your wallet to see balances and storage usage.</Text>
        </Stack>
      </Card>
    );
  }

  const signMessage = async () => {
    const message = createMessage({
      message: 'Login',
      recipient: 'abc',
    });

    const signedMessage = await signMessageAsync({ message });
    console.log('Signed message:', signedMessage);

    const isValid = await verifyMessage({
      signedMessage,
      message,
      client: createTestnetClient(),
    });
    console.log('IsValid', isValid);
  };

  return (
    <Card padding="xl" radius="md" withBorder>
      <Title order={3}>Sign Message</Title>
      <Button radius="md" color="#12b886" onClick={signMessage}>
        Sign Message
      </Button>
    </Card>
  );
};

export default SignMessage;

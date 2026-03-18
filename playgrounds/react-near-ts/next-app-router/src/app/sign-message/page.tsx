'use client';

import { Card, Button, Stack, Text, Title } from '@mantine/core';
import {
  useConnectedAccount,
  useSignMessage,
  createMessage,
  verifyMessage,
  createTestnetClient,
} from 'react-near-ts';

/*
{
  signerAccountId: 'eclipseer.testnet',
  signerPublicKey: 'ed25519:6RrvkTQKSo1DwW23rv3TWLhZZw5jySeW1AEVrLSfAhka',
  message: {
    data: 'Login',
    requester: 'abc',
    nonce: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
  },
  signature: 'ed25519:2nMMjTCcptnHifxT5vT3QNdBXTx3No7iVYo4MiEJS6moSEf1coEtPUNhyR1DStccN7r2fpZhuxNT8hzpi9zrL56j'
}
 */

const SignMessage = () => {
  const { isConnectedAccount } = useConnectedAccount();
  const signMessage = useSignMessage();

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

  const signMessageAsync = async () => {
    const message = createMessage({
      data: 'Login',
      requester: 'abc',
      // nonce: new Uint8Array(32).fill(0),
    });

    const signedMessage = await signMessage.mutateAsync({ message });
    console.log('Signed message:', signedMessage);

    const isValid = await verifyMessage({
      signedMessage,
      originMessage: message,
      client: createTestnetClient(),
    });
    console.log('IsValid', isValid);
  };

  return (
    <Card padding="xl" radius="md" withBorder>
      <Title order={3}>Sign Message</Title>
      <Button radius="md" color="#12b886" onClick={signMessageAsync}>
        Sign Message
      </Button>
    </Card>
  );
};

export default SignMessage;

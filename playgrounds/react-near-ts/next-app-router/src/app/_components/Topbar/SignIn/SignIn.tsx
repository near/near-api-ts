import { Button, Flex, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { WithAddFunctionCallKey } from '@/app/_components/Topbar/SignIn/WithAddFunctionCallKey/WithAddFunctionCallKey.tsx';
import { WithoutAdditionalAction } from '@/app/_components/Topbar/SignIn/WithoutAdditionalAction/WithoutAdditionalAction.tsx';
import { WithSignMessage } from '@/app/_components/Topbar/SignIn/WithSignMessage/WithSignMessage.tsx';

const signInOptions = [
  {
    title: 'Only Sign In',
    description:
      'Connect your NEAR wallet and retrieve your account address. ' +
      'No additional permissions are requested.',
    component: WithoutAdditionalAction,
  },
  {
    title: 'Sign In + Sign Message',
    description:
      'Connect your wallet and sign an arbitrary message. Useful for ' +
      'proving account ownership without executing a transaction (e.g. off-chain auth).',
    component: WithSignMessage,
  },
  {
    title: 'Sign In + Add Function Call Key',
    description:
      'Connect your wallet and authorize a dapp to call specific contract functions on your behalf, ' +
      'without requiring wallet confirmation each time.',
    component: WithAddFunctionCallKey,
  },
] as const;

export const SignIn = () => {
  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button size="sm" radius="md" onClick={open} color="#12b886">
        Sign In
      </Button>
      <Modal opened={isOpen} onClose={close} size="lg" withCloseButton={false} centered radius="lg">
        <Stack gap="sm" p="sm">
          {signInOptions.map(({ title, description, component: Component }) => (
            <Paper key={title} withBorder p="md" radius="md">
              <Stack gap="xs">
                <Title order={5}>{title}</Title>
                <Text size="sm" c="dimmed">
                  {description}
                </Text>
                <Flex align="center" justify="flex-end">
                  <Component closeModal={close} />
                </Flex>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Modal>
    </>
  );
};

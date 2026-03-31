import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { WithAddFunctionCallKey } from '@/app/_components/Topbar/SignIn/WithAddFunctionCallKey/WithAddFunctionCallKey.tsx';
import { WithoutAdditionalAction } from '@/app/_components/Topbar/SignIn/WithoutAdditionalAction/WithoutAdditionalAction.tsx';
import { WithSignMessage } from '@/app/_components/Topbar/SignIn/WithSignMessage/WithSignMessage.tsx';

export const SignIn = () => {
  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button size="sm" radius="md" onClick={open} color="#12b886">
        Sign In
      </Button>
      <Modal
        opened={isOpen}
        onClose={close}
        size="lg"
        title="Sign In Options"
        centered
      >
        <WithoutAdditionalAction closeModal={close} />
        <WithSignMessage closeModal={close} />
        <WithAddFunctionCallKey closeModal={close} />
      </Modal>
    </>
  );
};

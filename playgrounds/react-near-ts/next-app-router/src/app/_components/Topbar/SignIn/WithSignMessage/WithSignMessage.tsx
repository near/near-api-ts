import { Button } from '@mantine/core';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { createMessage, useNearSignIn } from 'react-near-ts';

// Simulates fetching a sign message from the backend before initiating sign-in.
// In real apps, the backend generates a unique nonce-based message to prevent replay attacks.
const useFetchMessageFromBackend = () =>
  useMutation(
    {
      mutationFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return createMessage({ message: 'Hello, Near!', recipient: 'near' });
      },
    },
    new QueryClient(),
  );

type WithSignMessageProps = {
  closeModal: () => void;
};

// Sign-in flow that also requests the wallet to sign an arbitrary message.
// Useful for proving account ownership without executing a transaction (e.g. auth, identity verification).
export const WithSignMessage = (props: WithSignMessageProps) => {
  const fetchMessageMutation = useFetchMessageFromBackend();
  const { signInAsync } = useNearSignIn({ additionalAction: 'SignMessage' });

  // Fetch the message first, then close the modal and proceed with sign-in + message signing
  const signIn = async () => {
    const messageToSign = await fetchMessageMutation.mutateAsync(undefined, {
      onSuccess: () => props.closeModal(),
    });
    const output = await signInAsync({ message: messageToSign });
    console.log('Sign In + SignedMessage: ', output);
  };

  return (
    <Button onClick={signIn} loading={fetchMessageMutation.isPending}>
      Sign In + Sign Message
    </Button>
  );
};

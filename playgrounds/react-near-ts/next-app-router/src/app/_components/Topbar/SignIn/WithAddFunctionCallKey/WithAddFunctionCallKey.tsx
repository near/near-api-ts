import { Button } from '@mantine/core';
import { randomEd25519KeyPair, useNearSignIn } from 'react-near-ts';

type WithAddFunctionCallKeyProps = {
  closeModal: () => void;
};

export const WithAddFunctionCallKey = (props: WithAddFunctionCallKeyProps) => {
  const { signInAsync } = useNearSignIn({ additionalAction: 'AddFunctionCallKey' });

  const signIn = async () => {
    props.closeModal();

    const output = await signInAsync({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'testnet',
      gasBudget: { near: '1000' },
      allowedFunctions: 'AllNonPayable',
    });
    console.log('Sign In + Add Function Call Key: ', output);
  };

  return <Button onClick={signIn}>Sign In + Add Function Call Key</Button>;
};

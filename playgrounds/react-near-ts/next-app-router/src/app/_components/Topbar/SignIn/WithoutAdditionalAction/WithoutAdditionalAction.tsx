import { Button } from '@mantine/core';
import { useNearSignIn } from 'react-near-ts';

type WithoutAdditionalActionProps = {
  closeModal: () => void;
};

export const WithoutAdditionalAction = (props: WithoutAdditionalActionProps) => {
  const { signInAsync } = useNearSignIn();

  const signIn = async () => {
    props.closeModal();
    const output = await signInAsync();
    console.log('Sign In: ', output);
  };

  return <Button onClick={signIn}>Only Sign In</Button>;
};

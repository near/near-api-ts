import { Badge, Group, Menu, Paper, Text } from '@mantine/core';
import { AccountId, useNearSignOut } from 'react-near-ts';

type ConnectedAccountProps = {
  connectedAccountId: AccountId;
};

export const ConnectedAccount = (props: ConnectedAccountProps) => {
  const { signOut } = useNearSignOut();

  return (
    <Menu position="bottom-end" width={150} withinPortal>
      <Menu.Target>
        <Paper radius="md" withBorder>
          <Group style={{ padding: '6px', gap: '6px', cursor: 'pointer' }}>
            <Badge color="teal" variant="light" radius="sm" style={{ cursor: 'pointer' }}>
              {props.connectedAccountId}
            </Badge>
            <Text size="xs" c="dimmed">
              ▾
            </Text>
          </Group>
        </Paper>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => signOut()}>Sign Out</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

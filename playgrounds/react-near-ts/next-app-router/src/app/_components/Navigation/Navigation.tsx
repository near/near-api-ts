'use client';

import { Group, Card } from '@mantine/core';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import cn from './Navigation.module.css';

const items = [
  { href: '/account-info', label: 'Account Info' },
  { href: '/send-near', label: 'Send Near' },
  { href: '/contract-records', label: 'Contract Records' },
  { href: '/sign-message', label: 'Sign Message' },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <Card radius="md" withBorder>
      <Group gap="xs">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <div
              key={it.href}
              className={
                active ? cn.activeLinkContainer : cn.inactiveLinkContainer
              }
            >
              <Link href={it.href}>{it.label}</Link>
            </div>
          );
        })}
      </Group>
    </Card>
  );
};
/*
style={{
                paddingBottom: 12,
                textDecoration: 'none',
                color: 'inherit',
                borderBottom: active
                  ? '2px solid var(--mantine-color-blue-6)'
                  : '2px solid transparent',
                fontWeight: active ? 600 : 400,
              }}
 */

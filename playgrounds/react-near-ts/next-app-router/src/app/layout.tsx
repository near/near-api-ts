import { Container, MantineProvider, Space } from '@mantine/core';
import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import React from 'react';
import { Topbar } from './_components/Topbar/Topbar';
import './globals.css';
import '@mantine/core/styles.css';
import { Navigation } from './_components/Navigation/Navigation';
import { CustomNearProvider } from '@/app/CustomNearProvider.tsx';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'React Near TS Playground',
  description: 'Minimalist Next.js example for react-near-ts',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
    <body className={bodyFont.variable}>
      <CustomNearProvider>
        <MantineProvider>
          <Space h="lg" />
          <Container size="sm">
            <Topbar />
            <Space h="xs" />
            <Navigation />
            <Space h="xs" />
            {children}
          </Container>
        </MantineProvider>
      </CustomNearProvider>
    </body>
  </html>
);

export default RootLayout;

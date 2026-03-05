import React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import { MantineProvider, Space, Container } from '@mantine/core';
import { Topbar } from '@/app/_components/Topbar/Topbar';
import './globals.css';
import '@mantine/core/styles.css';
import { TestnetNearProvider } from 'react-near-ts';
import { Navigation } from '@/app/_components/Navigation/Navigation';

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
      <TestnetNearProvider>
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
      </TestnetNearProvider>
    </body>
  </html>
);

export default RootLayout;

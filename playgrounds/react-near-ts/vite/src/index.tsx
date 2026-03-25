import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';
import { TestnetNearProvider } from 'react-near-ts';
import { App } from './App.tsx';
import '@mantine/core/styles.css';

createRoot(document.getElementById('root')!).render(
  <TestnetNearProvider>
    <MantineProvider>
      <App />
    </MantineProvider>
  </TestnetNearProvider>,
);

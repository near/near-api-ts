import { createServer } from 'node:net';
import { LOCALHOST } from './startShardedSandbox';

const getAvailablePort = async (reservedPorts: Set<number>) => {
  for (;;) {
    const port = await new Promise<number>((resolve, reject) => {
      const server = createServer();

      server.on('error', reject);
      server.listen({ host: LOCALHOST, port: 0 }, () => {
        const address = server.address();

        if (typeof address === 'object' && address !== null) {
          const { port } = address;
          server.close(() => resolve(port));
          return;
        }

        server.close();
        reject(new Error('Could not determine available port'));
      });
    });

    if (!reservedPorts.has(port)) {
      reservedPorts.add(port);
      return port;
    }
  }
};

export const getAvailablePorts = async (count: number) => {
  const reservedPorts = new Set<number>();
  const ports: number[] = [];

  for (let i = 0; i < count; i++) {
    ports.push(await getAvailablePort(reservedPorts));
  }

  return ports as [number, number];
};

import express from 'express';
import proxy from 'express-http-proxy';

export const createMockRpc = async ({ port }: { port: number }) => {
  const app = express();

  const state = {
    counter: 0,
  };

  app.use((req, res, next) => {
    state.counter += 1;

    // Every 3 request - failed
    if (state.counter % 3 === 0) {
      return res.status(500).end();
    }

    next();
  });

  app.use(proxy('http://localhost:4560'));

  const server = app.listen(port, () =>
    console.log(`Mock RPC server is up on port: ${port}`),
  );

  process.on('SIGINT', () => server.close());
  process.on('SIGTERM', () => server.close());

  return server;
};

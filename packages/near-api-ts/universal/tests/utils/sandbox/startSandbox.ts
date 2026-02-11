import { GenesisAccount, Sandbox } from 'near-sandbox';

export const startSandbox = async () =>
  await Sandbox.start({
    version: '2.10.6',
    config: {
      rpcPort: 4560,
      additionalAccounts: [
        GenesisAccount.createDefault('nat'),
        GenesisAccount.createDefault('alice'),
        GenesisAccount.createDefault('bob'),
      ],
    },
  });

export const withSandbox = async (
  fn: (args: { rpcUrl: string }) => Promise<void>,
) => {
  console.log('starting sandbox...');
  const sandbox = await startSandbox();
  console.log(sandbox);
  try {
    await fn({ rpcUrl: sandbox.rpcUrl });
  } catch (e) {
    throw e;
  } finally {
    await sandbox.stop();
  }
};

import { GenesisAccount, Sandbox } from 'near-sandbox';
import { consola } from 'consola';

const sandbox = await Sandbox.start({
  version: '2.9.0',
  config: {
    rpcPort: 4560,
    additionalAccounts: [
      GenesisAccount.createDefault('nat'),
      GenesisAccount.createDefault('ft'),
    ],
  },
});

consola.success(`Start sandbox. RPC node: ${sandbox.rpcUrl}`);

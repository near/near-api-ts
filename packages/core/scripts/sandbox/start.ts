import { GenesisAccount, Sandbox } from 'near-sandbox';
import { consola } from 'consola';

const sandbox = await Sandbox.start({
  version: '2.10.1',
  config: {
    rpcPort: 4560,
    additionalAccounts: [
      GenesisAccount.createDefault('nat'),
      GenesisAccount.createDefault('ft'),
    ],
    additionalGenesis: {
      transaction_validity_period: 1000,
    },
  },
});

consola.success(`Start sandbox. RPC node: ${sandbox.rpcUrl}`);

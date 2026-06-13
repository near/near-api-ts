import { GenesisAccount, Sandbox } from 'near-sandbox';

const sandbox = await Sandbox.start({
  version: '2.12.0',
  config: {
    rpcPort: 4567,
    additionalAccounts: [
      GenesisAccount.createDefault('nat'),
      GenesisAccount.createDefault('alice'),
      GenesisAccount.createDefault('bob'),
    ],
    additionalGenesis: {
      epoch_length: 500,
      transaction_validity_period: 1000
    },
  },
});

console.log('Sandbox started: ', sandbox.rpcUrl);

import { GenesisAccount, Sandbox } from 'near-sandbox';
import { near } from '../../../index';

type StartSandboxArgs = {
  rpcPort?: number;
  nearcoreVersion?: string;
};

export const startSandbox = async (args?: StartSandboxArgs) =>
  await Sandbox.start({
    version: args?.nearcoreVersion ?? '2.13.0',
    config: {
      rpcPort: args?.rpcPort,
      additionalAccounts: [
        GenesisAccount.createDefault('nat'),
        GenesisAccount.createDefault('alice'),
        GenesisAccount.createDefault('bob'),
        new GenesisAccount(
          'relay',
          'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44',
          'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6',
          near('10000').yoctoNear,
        ),
      ],
    },
  });

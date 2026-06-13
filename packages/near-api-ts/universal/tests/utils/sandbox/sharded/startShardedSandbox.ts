import {
  DEFAULT_PRIVATE_KEY,
  DEFAULT_PUBLIC_KEY,
  GenesisAccount,
  Sandbox,
  type SandboxConfig,
} from 'near-sandbox';
import { type NearToken, near, yoctoNear } from '../../../../index';
import { safeSleep } from '../../../../src/_common/utils/sleep';
import { getAvailablePorts } from './getAvailablePorts';

const SANDBOX_VERSION = '2.12.0';
export const LOCALHOST = '127.0.0.1';

const NODE0_PUBLIC_KEY = 'ed25519:7PGseFbWxvYVgZ89K1uTJKYoKetWs7BJtbyXDzfbAcqX';
const NODE0_PRIVATE_KEY =
  'ed25519:3D4YudUQRE39Lc4JHghuB5WM8kbgDDa34mnrEP5DdTApVH81af7e2dWgNPEaiQfdJnZq1CNPp5im4Rg5b733oiMP';
const NODE1_PUBLIC_KEY = 'ed25519:6DSjZ8mvsRZDvFqFxo8tCKePG96omXW7eVYVSySmDk8e';
const NODE1_PRIVATE_KEY =
  'ed25519:3D4YudUahN1nawWogh8pAKSj92sUNMdbZGjn7kERKzYoTy8tnFQuwoGUC51DowKqorvkr2pytJSnwuSbsNVfqygr';

const VALIDATOR_STAKE = near('100000');
const VALIDATOR_BALANCE = near('0');
const TREASURY_BALANCE = near('100000');
const DEFAULT_TEST_BALANCE = near('10000');

const TOTAL_SUPPLY = yoctoNear(
  VALIDATOR_BALANCE.yoctoNear * 2n +
    VALIDATOR_STAKE.yoctoNear * 2n +
    TREASURY_BALANCE.yoctoNear +
    DEFAULT_TEST_BALANCE.yoctoNear * 4n,
);

const accountRecord = (accountId: string, amount: NearToken, locked?: NearToken) => ({
  Account: {
    account_id: accountId,
    account: {
      amount: amount.yoctoNear.toString(),
      locked: locked ? locked.yoctoNear.toString() : '0',
      code_hash: '11111111111111111111111111111111',
      storage_usage: 0,
      version: 'V1',
    },
  },
});

const accessKeyRecord = (accountId: string, publicKey = DEFAULT_PUBLIC_KEY) => ({
  AccessKey: {
    account_id: accountId,
    public_key: publicKey,
    access_key: {
      nonce: 0,
      permission: 'FullAccess',
    },
  },
});

const additionalGenesis = {
  protocol_version: 83,
  genesis_time: '2026-05-05T10:53:26.971459Z',
  chain_id: 'shardnet',
  genesis_height: 0,
  num_block_producer_seats: 2,
  num_block_producer_seats_per_shard: [1, 1],
  avg_hidden_validator_seats_per_shard: [],
  epoch_length: 60,
  validators: [
    {
      account_id: 'node0',
      public_key: NODE0_PUBLIC_KEY,
      amount: VALIDATOR_STAKE.yoctoNear.toString(),
    },
    {
      account_id: 'node1',
      public_key: NODE1_PUBLIC_KEY,
      amount: VALIDATOR_STAKE.yoctoNear.toString(),
    },
  ],
  total_supply: TOTAL_SUPPLY.yoctoNear.toString(),
  protocol_treasury_account: 'sandbox',
  shard_layout: {
    V2: {
      boundary_accounts: ['ggggg'],
      shard_ids: [0, 1],
      index_to_id_map: {
        '0': 0,
        '1': 1,
      },
      id_to_index_map: {
        '0': 0,
        '1': 1,
      },
      shards_split_map: null,
      shards_parent_map: null,
      version: 0,
    },
  },
  minimum_validators_per_shard: 1,
  shuffle_shard_assignment_for_chunk_producers: false,
  records: [
    accountRecord('node0', VALIDATOR_BALANCE, VALIDATOR_STAKE),
    accessKeyRecord('node0', NODE0_PUBLIC_KEY),
    accountRecord('node1', VALIDATOR_BALANCE, VALIDATOR_STAKE),
    accessKeyRecord('node1', NODE1_PUBLIC_KEY),
    accountRecord('sandbox', TREASURY_BALANCE),
    accessKeyRecord('sandbox'),
    accountRecord('alice', DEFAULT_TEST_BALANCE),
    accessKeyRecord('alice'),
    accountRecord('bob', DEFAULT_TEST_BALANCE),
    accessKeyRecord('bob'),
    accountRecord('nat', DEFAULT_TEST_BALANCE),
    accessKeyRecord('nat'),
    accountRecord('relay', DEFAULT_TEST_BALANCE),
    accessKeyRecord('relay', 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44'),
  ],
};

const additionalAccounts = [
  new GenesisAccount(
    'alice',
    DEFAULT_PUBLIC_KEY,
    DEFAULT_PRIVATE_KEY,
    DEFAULT_TEST_BALANCE.yoctoNear,
  ),
  new GenesisAccount(
    'bob',
    DEFAULT_PUBLIC_KEY,
    DEFAULT_PRIVATE_KEY,
    DEFAULT_TEST_BALANCE.yoctoNear,
  ),
  new GenesisAccount(
    'nat',
    DEFAULT_PUBLIC_KEY,
    DEFAULT_PRIVATE_KEY,
    DEFAULT_TEST_BALANCE.yoctoNear,
  ),
  new GenesisAccount(
    'relay',
    'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44',
    'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6',
    DEFAULT_TEST_BALANCE.yoctoNear,
  ),
];

const createNodeConfig = ({
  rpcPort,
  netPort,
  nodeKey,
  validatorKey,
  trackedShard,
  bootNodes = '',
}: {
  rpcPort?: number;
  netPort: number;
  nodeKey: Record<string, string>;
  validatorKey: Record<string, string>;
  trackedShard: string;
  bootNodes?: string;
}): SandboxConfig => ({
  rpcPort,
  netPort,
  nodeKey,
  validatorKey,
  additionalAccounts,
  additionalGenesis,
  additionalConfig: {
    network: {
      boot_nodes: bootNodes,
      public_addrs: [`${nodeKey.public_key}@${LOCALHOST}:${netPort}`],
      allow_private_ip_in_public_addrs: true,
    },
    consensus: {
      min_num_peers: 1,
      block_production_tracking_delay: {
        secs: 0,
        nanos: 10000000,
      },
      min_block_production_delay: {
        secs: 0,
        nanos: 600000000,
      },
      max_block_production_delay: {
        secs: 2,
        nanos: 0,
      },
      produce_empty_blocks: true,
    },
    tracked_shards_config: { Shards: [trackedShard] },
    save_tx_outcomes: true,
  },
});

type StartShardedSandboxOptions = {
  rpcPorts?: readonly [node0: number, node1: number];
  netPorts?: readonly [node0: number, node1: number];
};

export const startShardedSandbox = async (options: StartShardedSandboxOptions = {}) => {
  const [node0RpcPort, node1RpcPort] = options.rpcPorts ?? [];
  const [node0NetPort, node1NetPort] = options.netPorts ?? (await getAvailablePorts(2));
  const node0BootNode = `${NODE0_PUBLIC_KEY}@${LOCALHOST}:${node0NetPort}`;

  const node0 = await Sandbox.start({
    version: SANDBOX_VERSION,
    config: createNodeConfig({
      rpcPort: node0RpcPort,
      netPort: node0NetPort,
      nodeKey: {
        account_id: 'placeholder',
        public_key: NODE0_PUBLIC_KEY,
        secret_key: NODE0_PRIVATE_KEY,
      },
      validatorKey: {
        account_id: 'node0',
        public_key: NODE0_PUBLIC_KEY,
        secret_key: NODE0_PRIVATE_KEY,
      },
      trackedShard: 's0.v0',
    }),
  });

  let node1: Sandbox | undefined;
  try {
    node1 = await Sandbox.start({
      version: SANDBOX_VERSION,
      config: createNodeConfig({
        rpcPort: node1RpcPort,
        netPort: node1NetPort,
        nodeKey: {
          account_id: 'placeholder',
          public_key: NODE1_PUBLIC_KEY,
          secret_key: NODE1_PRIVATE_KEY,
        },
        validatorKey: {
          account_id: 'node1',
          public_key: NODE1_PUBLIC_KEY,
          secret_key: NODE1_PRIVATE_KEY,
        },
        trackedShard: 's1.v0',
        bootNodes: node0BootNode,
      }),
    });

    // We want to wait for the genesis accounts state will be separated between shards - works from blockHeigh >= 1
    await safeSleep(1500);

    return [node0, node1];
  } catch (error) {
    await Promise.allSettled([node0.tearDown(), node1?.tearDown()]);
    throw error;
  }
};

import { GenesisAccount, Sandbox } from 'near-sandbox';
import { near } from '../../../index';

/**
 * `min_gas_purchase_price` (1e9 yoctoNEAR per gas unit) as set by the
 * `AccountCostIncrease` protocol feature (nearcore
 * `core/parameters/res/runtime_configs/85.yaml`).
 *
 * The runtime buys the gas attached to a receipt at
 * `max(current_gas_price, min_gas_purchase_price)` (`tx_cost` in nearcore
 * `runtime/runtime/src/config.rs`). The sandbox genesis sets `min_gas_price` to
 * 1e8, i.e. 10x below that floor, so every transaction is charged 10x for the
 * receipt part of its gas up front and gets the difference back through a
 * refund receipt. Refund receipts are excluded from every processing stage
 * except `CompletedFinal`, which makes balances read right after a transaction
 * both inflated in cost and timing-dependent.
 *
 * Starting the sandbox with `gasPrice: MIN_GAS_PURCHASE_PRICE` removes the gap:
 * no price-difference refunds are produced, so fees equal exactly
 * `gas * gasPrice` and balances are final as soon as the transaction is
 * executed.
 */
export const MIN_GAS_PURCHASE_PRICE = '1000000000';

type StartSandboxArgs = {
  rpcPort?: number;
  nearcoreVersion?: string;
  /**
   * Genesis `min_gas_price`, which nearcore also uses as the initial gas price
   * of the chain. Defaults to 1e8, the value a plain `neard init` genesis comes
   * with. Pass {@link MIN_GAS_PURCHASE_PRICE} when a test asserts exact
   * balances.
   */
  gasPrice?: string;
};

export const startSandbox = async (args?: StartSandboxArgs) =>
  await Sandbox.start({
    version: args?.nearcoreVersion ?? '2.13.2',
    config: {
      rpcPort: args?.rpcPort,
      additionalGenesis: { min_gas_price: args?.gasPrice ?? '100000000' },
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

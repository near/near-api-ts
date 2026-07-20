import { it } from 'vitest';
import * as z from 'zod/mini';
import { createMainnetClient } from '../../index';
import { log } from '../utils/common';

z.config(z.locales.en());

it('getTransactionResult', async () => {
  // const testnetClient = createTestnetClient();
  //
  // const txResult = await testnetClient.safeGetTransactionResult({
  //   // transactionHash: 'GMhxbrMZ4PAprLdwb9wyJ627kVRBWKK6yvfCTL8Mf5Fs',  // DelegateActionInvalidNonce
  //   // transactionHash: '3AByi9aq9KukKZRGSEVhkffk7Vjb2rpBKcf5daUdrKDY', // request - not SIR
  //   // transactionHash: '3QMHh2yBHBGrkcxQtPfx9npCnJsHaXTMcTTwmM4SbKSw', // sign (mpc) - not SIR
  //   transactionHash: '4Y9wvJ3TrkLxRW1d8BMQH6amRWtaDqcLdwFG9RWp9RJd', // SIR, delete account, refund failed
  //   // transactionHash: '33GmSjm2uudAknXkShLhE1idNd6FePWnKBT7Mqb6CA5b', // SIR, yield, request
  //   policies: { transport: { rpcTypePreferences: ['Archival', 'Regular'] } },
  // });
  //
  // log(txResult);

  const mainnetClient = createMainnetClient();

  const mainnetTxResult = await mainnetClient.safeGetTransactionResult({
    transactionHash: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe', // execute_intents - SIR
    // transactionHash: 'GxFGnomJ8znxJkpSduxZk7c9F3nqh7waAvnWxdFfxshK', // v1.signer - respond - not SIR
    // transactionHash: 'DSnehcspPKHuX44brwy4gWDhJYBaKwcP21Hq4qqjncE1', // wrap.near - ft_transfer_call - not SIR
    // transactionHash: '9usBJmQ3J1e2XTULjjkuyXPrsyRmp3CxDDVtVMd4HWgF', // old HostError::GuestPanic
    // transactionHash: '4NTSNVrJ2YSRKTvywbPd9iHd4EMLjES1CgsRay7LgErY',
    policies: { transport: { rpcTypePreferences: ['Archival', 'Regular'] } },
  });

  log(mainnetTxResult);
});

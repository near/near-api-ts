import type { CreateExecuteDelegationActionPublicErrorRegistry } from '../executeDelegation/executeDelegation';
import type { CreateAddAccessKeyActionPublicErrorRegistry } from './addAccessKey';
import type { CreateDeleteAccessKeyActionPublicErrorRegistry } from './deleteAccessKey';
import type { CreateDeleteActionPublicErrorRegistry } from './deleteAccount';
import type { CreateDeployLocalContractActionPublicErrorRegistry } from './deployLocalContract';
import type { CreateFunctionCallActionPublicErrorRegistry } from './functionCall';
import type { CreateLinkGlobalContractActionPublicErrorRegistry } from './linkGlobalContract';
import type { CreatePinGlobalContractActionPublicErrorRegistry } from './pinGlobalContract';
import type { CreatePublishLinkableGlobalContractActionPublicErrorRegistry } from './publishLinkableGlobalContract';
import type { CreatePublishPinnableGlobalContractActionPublicErrorRegistry } from './publishPinnableGlobalContract';
import type { CreateStakeActionPublicErrorRegistry } from './stake';
import type { CreateTopUpAccessKeyBalanceActionPublicErrorRegistry } from './topUpAccessKeyBalance';
import type { CreateTransferActionPublicErrorRegistry } from './transfer';
import type { CreateWithdrawAccessKeyBalanceActionPublicErrorRegistry } from './withdrawAccessKeyBalance';

export interface ActionsPublicErrorRegistry
  extends CreateAddAccessKeyActionPublicErrorRegistry,
    CreateTransferActionPublicErrorRegistry,
    CreateFunctionCallActionPublicErrorRegistry,
    CreateStakeActionPublicErrorRegistry,
    CreateDeployLocalContractActionPublicErrorRegistry,
    CreateDeleteAccessKeyActionPublicErrorRegistry,
    CreateDeleteActionPublicErrorRegistry,
    CreateExecuteDelegationActionPublicErrorRegistry,
    CreatePublishPinnableGlobalContractActionPublicErrorRegistry,
    CreatePublishLinkableGlobalContractActionPublicErrorRegistry,
    CreateLinkGlobalContractActionPublicErrorRegistry,
    CreatePinGlobalContractActionPublicErrorRegistry,
    CreateTopUpAccessKeyBalanceActionPublicErrorRegistry,
    CreateWithdrawAccessKeyBalanceActionPublicErrorRegistry {}

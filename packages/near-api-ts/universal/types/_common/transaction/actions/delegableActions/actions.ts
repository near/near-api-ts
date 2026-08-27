import type { CreateExecuteDelegationActionPublicErrorRegistry } from '../executeDelegation/executeDelegation';
import type { CreateAddKeyActionPublicErrorRegistry } from './addKey';
import type { CreateDeleteActionPublicErrorRegistry } from './deleteAccount';
import type { CreateDeleteKeyActionPublicErrorRegistry } from './deleteKey';
import type { CreateDeployContractActionPublicErrorRegistry } from './deployContract';
import type { CreateFunctionCallActionPublicErrorRegistry } from './functionCall';
import type { CreateRegisterGlobalContractActionPublicErrorRegistry } from './registerGlobalContract';
import type { CreateStakeActionPublicErrorRegistry } from './stake';
import type { CreateTransferActionPublicErrorRegistry } from './transfer';
import type { CreateUseGlobalContractActionPublicErrorRegistry } from './useGlobalContract';

export interface ActionsPublicErrorRegistry
  extends CreateAddKeyActionPublicErrorRegistry,
    CreateTransferActionPublicErrorRegistry,
    CreateFunctionCallActionPublicErrorRegistry,
    CreateStakeActionPublicErrorRegistry,
    CreateDeployContractActionPublicErrorRegistry,
    CreateDeleteKeyActionPublicErrorRegistry,
    CreateDeleteActionPublicErrorRegistry,
    CreateExecuteDelegationActionPublicErrorRegistry,
    CreateRegisterGlobalContractActionPublicErrorRegistry,
    CreateUseGlobalContractActionPublicErrorRegistry {}

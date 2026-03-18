import type { CreateAddKeyActionPublicErrorRegistry } from './addKey';
import type { CreateDeleteActionPublicErrorRegistry } from './deleteAccount';
import type { CreateDeleteKeyActionPublicErrorRegistry } from './deleteKey';
import type { CreateDeployContractActionPublicErrorRegistry } from './deployContract';
import type { CreateFunctionCallActionPublicErrorRegistry } from './functionCall';
import type { CreateStakeActionPublicErrorRegistry } from './stake';
import type { CreateTransferActionPublicErrorRegistry } from './transfer';

export interface ActionsPublicErrorRegistry
  extends CreateAddKeyActionPublicErrorRegistry,
    CreateTransferActionPublicErrorRegistry,
    CreateFunctionCallActionPublicErrorRegistry,
    CreateStakeActionPublicErrorRegistry,
    CreateDeployContractActionPublicErrorRegistry,
    CreateDeleteKeyActionPublicErrorRegistry,
    CreateDeleteActionPublicErrorRegistry {}

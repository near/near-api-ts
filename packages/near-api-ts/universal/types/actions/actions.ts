import type { CreateAddKeyActionPublicErrorRegistry } from '@universal/types/actions/addKey';
import type { CreateDeleteActionPublicErrorRegistry } from '@universal/types/actions/deleteAccount';
import type { CreateDeleteKeyActionPublicErrorRegistry } from '@universal/types/actions/deleteKey';
import type { CreateDeployContractActionPublicErrorRegistry } from '@universal/types/actions/deployContract';
import type { CreateFunctionCallActionPublicErrorRegistry } from '@universal/types/actions/functionCall';
import type { CreateStakeActionPublicErrorRegistry } from '@universal/types/actions/stake';
import type { CreateTransferActionPublicErrorRegistry } from '@universal/types/actions/transfer';

export interface ActionsPublicErrorRegistry
  extends CreateAddKeyActionPublicErrorRegistry,
    CreateTransferActionPublicErrorRegistry,
    CreateFunctionCallActionPublicErrorRegistry,
    CreateStakeActionPublicErrorRegistry,
    CreateDeployContractActionPublicErrorRegistry,
    CreateDeleteKeyActionPublicErrorRegistry,
    CreateDeleteActionPublicErrorRegistry {}

import type { CreateAddKeyActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/addKey';
import type { CreateDeleteActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/deleteAccount';
import type { CreateDeleteKeyActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/deleteKey';
import type { CreateDeployContractActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/deployContract';
import type { CreateFunctionCallActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/functionCall';
import type { CreateStakeActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/stake';
import type { CreateTransferActionPublicErrorRegistry } from '@universal/types/_common/transaction/actions/transfer';

export interface ActionsPublicErrorRegistry
  extends CreateAddKeyActionPublicErrorRegistry,
    CreateTransferActionPublicErrorRegistry,
    CreateFunctionCallActionPublicErrorRegistry,
    CreateStakeActionPublicErrorRegistry,
    CreateDeployContractActionPublicErrorRegistry,
    CreateDeleteKeyActionPublicErrorRegistry,
    CreateDeleteActionPublicErrorRegistry {}

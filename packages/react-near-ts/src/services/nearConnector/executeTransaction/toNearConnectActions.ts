import type { Action as NatAction, TransactionIntent } from 'near-api-ts';
import { nearGas, nearToken } from 'near-api-ts';
import type { NearConnectAction } from '../../../../types/services/nearConnect.ts';

const toNearConnectAction = (action: NatAction): NearConnectAction => {
  if (action.actionType === 'CreateAccount')
    return {
      createAccount: {},
    };

  if (action.actionType === 'Transfer')
    return {
      transfer: { deposit: nearToken(action.amount).yoctoNear },
    };

  if (action.actionType === 'AddKey')
    return {
      addKey: {
        publicKey: action.publicKey,
        accessKey: {
          nonce: 0n, // deprecated field
          permission:
            action.accessType === 'FullAccess'
              ? { fullAccess: {} }
              : {
                  functionCall: {
                    receiverId: action.contractAccountId,
                    methodNames:
                      action.allowedFunctions === 'AllNonPayable'
                        ? undefined
                        : action.allowedFunctions,
                    allowance:
                      action.gasBudget === 'Unlimited'
                        ? undefined
                        : nearToken(action.gasBudget).yoctoNear,
                  },
                },
        },
      },
    };

  if (action.actionType === 'FunctionCall')
    return {
      functionCall: {
        methodName: action.functionName,
        args: action.functionArgs,
        gas: nearGas(action.gasLimit).gas,
        deposit: action.attachedDeposit ? nearToken(action.attachedDeposit).yoctoNear : 0n,
      },
    };

  if (action.actionType === 'DeployContract')
    return {
      deployContract: {
        code: action.wasmBytes,
      },
    };

  if (action.actionType === 'Stake')
    return {
      stake: {
        stake: nearToken(action.amount).yoctoNear,
        publicKey: action.validatorPublicKey,
      },
    };

  if (action.actionType === 'DeleteKey')
    return {
      deleteKey: {
        publicKey: action.publicKey,
      },
    };

  if (action.actionType === 'DeleteAccount')
    return {
      deleteAccount: {
        beneficiaryId: action.beneficiaryAccountId,
      },
    };

  // Never reached
  throw new Error(`Unsupported action type: ${action}`);
};

export const toNearConnectActions = (intent: TransactionIntent): NearConnectAction[] => {
  if (intent.action) return [toNearConnectAction(intent.action)];
  if (intent.actions) return intent.actions.map((action) => toNearConnectAction(action));
  return [];
};

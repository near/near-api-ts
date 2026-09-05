import type { ConnectorAction } from '@hot-labs/near-connect';
import type {
  DelegationIntent,
  TransactionAction as NatAction,
  TransactionIntent,
} from 'near-api-ts';
import { nearGas, nearToken } from 'near-api-ts';

/**
 * near-connect takes `args` as a JSON value, while near-api-ts hands us the
 * bytes it already serialized - so we decode them back, exactly the way
 * near-connect decodes them for a near-api-js action.
 *
 * Args a custom `serializeArgs` produced (borsh, say) are not JSON, so they
 * travel on as the raw bytes - which is what near-connect forwards for them
 * too. Bytes that happen to parse as JSON are read as JSON: by the time we hold
 * a `FunctionCallAction` the serializer that produced them is no longer known,
 * so there is nothing better to go on.
 */
const toConnectorArgs = (functionArgs: Uint8Array) => {
  try {
    return JSON.parse(new TextDecoder().decode(functionArgs));
  } catch {
    return functionArgs;
  }
};

const toNearConnectAction = (action: NatAction): ConnectorAction => {
  if (action.actionType === 'CreateAccount')
    return {
      type: 'CreateAccount',
    };

  if (action.actionType === 'Transfer')
    return {
      type: 'Transfer',
      params: { deposit: nearToken(action.amount).yoctoNear.toString() },
    };

  if (action.actionType === 'AddKey')
    return {
      type: 'AddKey',
      params: {
        publicKey: action.publicKey,
        accessKey: {
          nonce: 0, // deprecated field
          permission:
            action.accessType === 'FullAccess'
              ? 'FullAccess'
              : {
                  receiverId: action.contractAccountId,
                  allowance:
                    action.gasBudget === 'Unlimited'
                      ? undefined
                      : nearToken(action.gasBudget).yoctoNear.toString(),
                  methodNames:
                    action.allowedFunctions === 'AllNonPayable'
                      ? undefined
                      : action.allowedFunctions,
                },
        },
      },
    };

  if (action.actionType === 'FunctionCall')
    return {
      type: 'FunctionCall',
      params: {
        methodName: action.functionName,
        args: toConnectorArgs(action.functionArgs),
        gas: nearGas(action.gasLimit).gas.toString(),
        deposit: (action.attachedDeposit
          ? nearToken(action.attachedDeposit).yoctoNear
          : 0n
        ).toString(),
      },
    };

  if (action.actionType === 'DeployContract')
    return {
      type: 'DeployContract',
      params: { code: action.wasmU8 },
    };

  if (action.actionType === 'Stake')
    return {
      type: 'Stake',
      params: {
        stake: nearToken(action.amount).yoctoNear.toString(),
        publicKey: action.validatorPublicKey,
      },
    };

  if (action.actionType === 'DeleteKey')
    return {
      type: 'DeleteKey',
      params: { publicKey: action.publicKey },
    };

  if (action.actionType === 'DeleteAccount')
    return {
      type: 'DeleteAccount',
      params: { beneficiaryId: action.beneficiaryAccountId },
    };

  if (action.actionType === 'RegisterPinnableGlobalContract')
    return {
      type: 'DeployGlobalContract',
      params: { code: action.wasmU8, deployMode: 'CodeHash' },
    };

  if (action.actionType === 'RegisterLinkableGlobalContract')
    return {
      type: 'DeployGlobalContract',
      params: { code: action.wasmU8, deployMode: 'AccountId' },
    };

  if (action.actionType === 'PinGlobalContract')
    return {
      type: 'UseGlobalContract',
      params: { contractIdentifier: { codeHash: action.globalContractWasmHash } },
    };

  if (action.actionType === 'LinkGlobalContract')
    return {
      type: 'UseGlobalContract',
      params: { contractIdentifier: { accountId: action.globalContractAccountId } },
    };

  // near-connect has no wire format for this one, so a wallet cannot be asked to sign it.
  if (action.actionType === 'ExecuteDelegation')
    throw new Error(`near-connect does not support the ${action.actionType} action`);

  // Never reached - fails to compile once near-api-ts adds an action we do not handle.
  const unhandledAction: never = action;
  throw new Error(`Unknown action type: ${JSON.stringify(unhandledAction)}`);
};

// TODO make sure that it will work only without a sponsor action;
export const toNearConnectActions = (
  intent: Omit<TransactionIntent, 'receiverAccountId'>,
): ConnectorAction[] => {
  if (intent.action) return [toNearConnectAction(intent.action)];
  if (intent.actions) return intent.actions.map((action) => toNearConnectAction(action));
  return [];
};

// A delegation carries the same actions, only under its own field names.
export const toNearConnectDelegableActions = (
  intent: Omit<DelegationIntent, 'receiverAccountId' | 'expireAt'>,
): ConnectorAction[] => {
  if (intent.delegatedAction) return [toNearConnectAction(intent.delegatedAction)];
  if (intent.delegatedActions)
    return intent.delegatedActions.map((action) => toNearConnectAction(action));
  return [];
};

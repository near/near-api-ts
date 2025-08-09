import type { AddKeyAction } from 'nat-types/actions/addKey';
import type { PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  NearAmount,
} from 'nat-types/common';

type AddFullAccessKeyInput = {
  publicKey: PublicKey;
};

export const addFullAccessKey = ({
  publicKey,
}: AddFullAccessKeyInput): AddKeyAction => ({
  type: 'AddKey',
  params: {
    publicKey,
    permission: 'FullAccess',
  },
});

type AddFunctionCallInput = {
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget?: NearAmount;
  allowedFunctions?: ContractFunctionName[];
};

export const addFunctionCallKey = ({
  publicKey,
  contractAccountId,
  gasBudget,
  allowedFunctions,
}: AddFunctionCallInput): AddKeyAction => ({
  type: 'AddKey',
  params: {
    publicKey,
    permission: 'FunctionCall',
    restrictions: {
      contractAccountId,
      gasBudget,
      allowedFunctions,
    },
  },
});

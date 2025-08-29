import type { AddKeyAction } from 'nat-types/actions/addKey';
import type { PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  NearOption,
} from 'nat-types/common';

type AddFunctionCallInput = {
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget?: NearOption;
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
    accessType: 'FunctionCall',
    publicKey,
    contractAccountId,
    gasBudget,
    allowedFunctions,
  },
});

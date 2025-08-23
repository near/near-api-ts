import type { AddKeyAction } from 'nat-types/actions/addKey';
import type { PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  NearOption,
} from 'nat-types/common';
import {fromNearOption} from '../near';

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
    type: 'FunctionCall',
    publicKey,
    restrictions: {
      contractAccountId,
      gasBudget: gasBudget && fromNearOption(gasBudget),
      allowedFunctions,
    },
  },
});

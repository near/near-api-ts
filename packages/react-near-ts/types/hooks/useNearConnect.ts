import type { UseMutationResult } from '@tanstack/react-query';


/*
// option #1
type Args1 = void;
type Output1 = void;

connect: UseMutationResult<Output1, Error, Args1, unknown>;

// option #2
type Args2 = {
  action: {
    actionType: 'SignMessage';
    message: string;
  }
}

type Output2 = {
  signedMessage: {
    accountId: string;
    publicKey: string;
    signature: string;
  }
}

connect: UseMutationResult<Output2, Error, Args2, unknown>;

// Option #3

type Args3 = {
  action: {
    actionType: 'AddFunctionCallKey';
    publicKey: string;
  }
}

type Output3 = {
  transactionResult: unknown
}

connect: UseMutationResult<Output3, Error, Args3, unknown>;
 */

export type UseNearConnect = () => {
  connect: UseMutationResult<void, Error, void, unknown>;
  disconnect: UseMutationResult<void, Error, void, unknown>;
};


/*\
import type { UseMutationResult } from '@tanstack/react-query';

type DisconnectMutation = UseMutationResult<void, Error, void>;

type SignMessageArgs = {
  action: {
    actionType: 'SignMessage';
    message: string;
  };
};

type SignMessageOutput = {
  signedMessage: {
    accountId: string;
    publicKey: string;
    signature: string;
  };
};

type AddFunctionCallKeyArgs = {
  action: {
    actionType: 'AddFunctionCallKey';
    publicKey: string;
  };
};

type AddFunctionCallKeyOutput = {
  transactionResult: unknown;
};

export interface UseNearConnect {
  (): {
    connect: UseMutationResult<void, Error, void>;
    disconnect: DisconnectMutation;
  };
  (config: SignMessageArgs): {
    connect: UseMutationResult<SignMessageOutput, Error, SignMessageArgs>;
    disconnect: DisconnectMutation;
  };
  (config: AddFunctionCallKeyArgs): {
    connect: UseMutationResult<AddFunctionCallKeyOutput, Error, AddFunctionCallKeyArgs>;
    disconnect: DisconnectMutation;
  };
}
 */

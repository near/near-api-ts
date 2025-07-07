type FtTransferInput = {
  args: object;
  gasLimit: {
    tegaGas: string;
  };
};

const contractSource = {
  writeFunctions: {
    ftTransfer: ({ args, gasLimit }: FtTransferInput) => {
      return {
        actionType: 'FunctionCall',
        jsonArgs: args,
        gasLimit,
      };
    },
  },
};

type ContractSource = typeof contractSource;

export const createContract = ({ source }: { source: ContractSource }) => {
  return {
    ftTransfer: source.writeFunctions.ftTransfer,
  };
};

const contract = createContract({ source: contractSource });

const a = contract.ftTransfer();

console.log(a);

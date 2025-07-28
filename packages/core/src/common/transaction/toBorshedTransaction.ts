import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { SCHEMA } from '../borshSchemas/najSchema';

type InnerTransaction = {
  signerAccountId: string;
  signerPublicKey: string;
  action: any;
  actions?: any[];
  receiverAccountId: string;
  nonce: bigint | number;
  blockHash: string;
};

const extractData = (data: string) => {
  const [_, payload] = data.split(':');
  return base58.decode(payload);
};

export const toBorshedTransaction = (transaction: InnerTransaction) => {
  console.log('toBorshedTransaction');
  console.log(transaction);

  const obj = {
    signerId: transaction.signerAccountId,
    publicKey: {
      ed25519Key: {
        data: extractData(transaction.signerPublicKey),
      },
    },
    actions: [transaction.action],
    receiverId: transaction.receiverAccountId,
    nonce: BigInt(transaction.nonce),
    blockHash: base58.decode(transaction.blockHash),
  };

  // return TransactionSchema.serialize(obj);
  return serialize(SCHEMA.Transaction, obj)
};

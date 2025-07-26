import type { Transaction, Action } from '../../schemas/zorshSchema';
import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { SCHEMA } from '../../schemas/najSchema';

type InnerTransaction = {
  signerAccountId: string;
  signerPublicKey: string;
  action: Action;
  actions?: Action[];
  receiverAccountId: string;
  nonce: bigint | number;
  blockHash: string;
};

const getPublicKey = (publicKeyString: string) => {
  const [_, base58PublicKey] = publicKeyString.split(':');
  return Array.from(base58.decode(base58PublicKey));
};

export const toBorshedTransaction = (transaction: InnerTransaction) => {
  console.log('toBorshedTransaction');
  console.log(transaction);

  const obj: Transaction = {
    signerId: transaction.signerAccountId,
    publicKey: {
      ed25519Key: {
        data: getPublicKey(transaction.signerPublicKey),
      },
    },
    actions: [transaction.action],
    receiverId: transaction.receiverAccountId,
    nonce: BigInt(transaction.nonce),
    blockHash: Array.from(base58.decode(transaction.blockHash)),
  };

  // return TransactionSchema.serialize(obj);
  return serialize(SCHEMA.Transaction, obj)
};

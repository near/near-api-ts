import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { SCHEMA } from '../borshSchemas/najSchema';

export type InnerSignedTransaction = {
  signerAccountId: string;
  signerPublicKey: string;
  action: any;
  actions?: any[];
  receiverAccountId: string;
  nonce: bigint | number;
  blockHash: string;
  transactionHash: string;
  signature: string;
};

const extractData = (data: string) => {
  const [_, payload] = data.split(':');
  return base58.decode(payload);
};

export const toBorshedSignedTransaction = (
  signedTransaction: InnerSignedTransaction,
) => {
  const obj = {
    transaction: {
      signerId: signedTransaction.signerAccountId,
      publicKey: {
        ed25519Key: {
          data: extractData(signedTransaction.signerPublicKey),
        },
      },
      actions: [signedTransaction.action],
      receiverId: signedTransaction.receiverAccountId,
      nonce: BigInt(signedTransaction.nonce),
      blockHash: base58.decode(signedTransaction.blockHash),
    },
    signature: {
      ed25519Signature: {
        data: extractData(signedTransaction.signature),
      },
    },
  };
  // return TransactionSchema.serialize(obj);
  return serialize(SCHEMA.SignedTransaction, obj);
};

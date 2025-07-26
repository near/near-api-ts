import type { SignedTransaction, Action } from '../../schemas/zorshSchema';
import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { SCHEMA } from '../../schemas/najSchema';

export type InnerSignedTransaction = {
  signerAccountId: string;
  signerPublicKey: string;
  action: Action;
  actions?: Action[];
  receiverAccountId: string;
  nonce: bigint | number;
  blockHash: string;
  transactionHash: string;
  signature: string;
};

const extractData = (data: string) => {
  const [_, payload] = data.split(':');
  return Array.from(base58.decode(payload));
};

export const toBorshedSignedTransaction = (
  signedTransaction: InnerSignedTransaction,
) => {
  const obj: SignedTransaction = {
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
      blockHash: Array.from(base58.decode(signedTransaction.blockHash)),
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

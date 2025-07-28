import { base58 } from '@scure/base';

const extractData = (data: string) => {
  const [_, payload] = data.split(':');
  return base58.decode(payload);
};

export const addEd25519FullAccessKey = ({ publicKey }: any) => {
  return {
    addKey: {
      publicKey: {
        ed25519Key: {
          data: extractData(publicKey),
        },
      },
      accessKey: {
        nonce: 0n, // deprecated field, only for compatibility
        permission: {
          fullAccess: {},
        },
      },
    },
  };
};

export const addSecp256k1FullAccessKey = ({ publicKey }: any) => {
  return {
    addKey: {
      publicKey: {
        secp256k1Key: {
          data: extractData(publicKey),
        },
      },
      accessKey: {
        nonce: 0n, // deprecated field, only for compatibility
        permission: {
          fullAccess: {},
        },
      },
    },
  };
};

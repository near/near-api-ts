import {
  createIdbKeyService,
  randomEd25519KeyPair,
  transfer,
} from 'near-api-ts';
import cn from './App.module.css';

export const App = () => {
  const keyService = createIdbKeyService();

  const addKeyToIdb = async () => {
    const keyPair = randomEd25519KeyPair();
    const result = await keyService.addKey(keyPair);
    console.log('Result: ', result);
  };

  const clearIdb = async () => {
    await keyService.clear();
    console.log('Idb cleared');
  };

  const signTransaction = async () => {
    const kp1 = randomEd25519KeyPair();

    await keyService.addKey(kp1);

    const tx = await keyService.safeSignTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: kp1.publicKey,
        nonce: 1,
        blockHash: 'UQcU8hMLAG96mBFEW8rwn5hj1icKbgVUE4G3QKUB5gy',
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: '123.nat',
      },
    });
    console.log(tx);
  };

  return (
    <div className={cn.app}>
      <button onClick={addKeyToIdb}>Add key to idb</button>
      <button onClick={clearIdb}>Clear idb</button>
      <button onClick={signTransaction}>Sign transaction</button>
    </div>
  );
};

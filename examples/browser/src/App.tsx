import {
  createIdbKeyService,
  randomEd25519KeyPair,
  transfer,
} from 'near-api-ts';
import cn from './App.module.css';

export const App = () => {
  const keyService = createIdbKeyService();
  const keyPair = randomEd25519KeyPair();

  const addKeyToIdb = async () => {
    const result = await keyService.addKey(keyPair);
    console.log('Result: ', result);
  };

  const clearIdb = async () => {
    await keyService.clear();
    console.log('Idb cleared');
  };

  const signTransaction = async () => {
    const tx = await keyService.safeSignTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: keyPair.publicKey,
        nonce: 1,
        blockHash: 'UQcU8hMLAG96mBFEW8rwn5hj1icKbgVUE4G3QKUB5gy',
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: '123.nat',
      },
    });
    console.log(tx);
  };

  const hasKey = async () => {
    const result = await keyService.hasKey(keyPair);
    console.log('Has key: ', result);
  };

  const removeKey = async () => {
    const result = await keyService.removeKey(keyPair);
    console.log('key removed', result);
  };

  return (
    <div className={cn.app}>
      <button onClick={addKeyToIdb}>Add key to idb</button>
      <button onClick={clearIdb}>Clear idb</button>
      <button onClick={signTransaction}>Sign transaction</button>
      <button onClick={hasKey}>Has key</button>
      <button onClick={removeKey}>Remove key</button>
    </div>
  );
};

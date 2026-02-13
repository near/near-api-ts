export const openIdbConnection = (context: any) => {
  const dBOpenRequest = indexedDB.open(context.idbName, 1);

  dBOpenRequest.onupgradeneeded = (event) => {
    const idb = dBOpenRequest.result;
    console.log('onupgradeneeded');
    // Initialize Idb if it's not initialized yet
    if (event.oldVersion === 0) {
      idb.createObjectStore('keyPairs');
    }
  };

  dBOpenRequest.onsuccess = () => {
    console.log('onsuccess - 3');
    context.idb = dBOpenRequest.result;
  };

  dBOpenRequest.onerror = () => {
    console.log('onerror');
    // Internal error
  };
};

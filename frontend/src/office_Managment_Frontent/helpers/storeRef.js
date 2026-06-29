let _store = null;

export const configureStoreRef = (store) => {
  _store = store;
};

export const getStore = () => {
  if (!_store) {
    console.warn("Store not configured yet!");
  }
  return _store;
};

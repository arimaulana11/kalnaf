import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('kalnaf-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addProduct = async (product: { name: string; price: number }) => {
  const db = await initDB();
  await db.put('products', product);
};

export const getAllProducts = async () => {
  const db = await initDB();
  return db.getAll('products');
};

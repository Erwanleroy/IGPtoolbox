// src/indexeddb.js
import { openDB } from 'idb';

const DB_NAME = 'myDatabase';
const STORE_NAME = 'igpStore';

export async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

export async function saveData(data) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).put({ id: 1, data });
  await tx.done;
}

export async function getData() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const data = await tx.objectStore(STORE_NAME).get(1);
  await tx.done;
  return data ? data.data : null;
}

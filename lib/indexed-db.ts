
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'soukloop-db';
const STORE_NAME = 'product-form-data';
const VERSION = 1;

interface ProductFormDataSchema extends DBSchema {
    'product-form-data': {
        key: string;
        value: any;
    };
}

let dbPromise: Promise<IDBPDatabase<ProductFormDataSchema>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<ProductFormDataSchema>(DB_NAME, VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
}

export const saveFormData = async (key: string, data: any) => {
    try {
        const db = await getDB();
        await db.put(STORE_NAME, data, key);
    } catch (error) {
        console.error('Failed to save to IndexedDB:', error);
    }
};

export const getFormData = async (key: string) => {
    try {
        const db = await getDB();
        return await db.get(STORE_NAME, key);
    } catch (error) {
        console.error('Failed to get from IndexedDB:', error);
        return null;
    }
};

export const clearFormData = async (key: string) => {
    try {
        const db = await getDB();
        await db.delete(STORE_NAME, key);
    } catch (error) {
        console.error('Failed to clear IndexedDB:', error);
    }
};

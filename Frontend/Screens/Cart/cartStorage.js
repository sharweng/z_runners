import * as SQLite from 'expo-sqlite';

let dbPromise;

const getDb = async () => {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabaseAsync('cart.db');
    }

    return dbPromise;
};

export const initCartTable = async () => {
    const db = await getDb();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER NOT NULL,
            item_json TEXT NOT NULL
        );
    `);
};

export const getSavedCartItems = async () => {
    const db = await getDb();

    const rows = await db.getAllAsync(
        'SELECT item_json FROM cart_items ORDER BY sort_order ASC;'
    );

    return rows
        .map((row) => {
            try {
                return JSON.parse(row.item_json);
            } catch (error) {
                return null;
            }
        })
        .filter(Boolean);
};

export const replaceSavedCartItems = async (items) => {
    const db = await getDb();

    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM cart_items;');

        for (let index = 0; index < items.length; index += 1) {
            await db.runAsync(
                'INSERT INTO cart_items (sort_order, item_json) VALUES (?, ?);',
                [index, JSON.stringify(items[index])]
            );
        }
    });
};

export const clearSavedCartItems = async () => {
    const db = await getDb();

    await db.runAsync('DELETE FROM cart_items;');
};
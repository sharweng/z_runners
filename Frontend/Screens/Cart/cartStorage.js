import * as SQLite from 'expo-sqlite';

let dbPromise;
const GUEST_OWNER_KEY = 'guest';

const getOwnerKey = (ownerKey) => {
    if (!ownerKey || typeof ownerKey !== 'string') {
        return GUEST_OWNER_KEY;
    }

    const normalizedKey = ownerKey.trim();
    return normalizedKey.length ? normalizedKey : GUEST_OWNER_KEY;
};

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

    const columns = await db.getAllAsync('PRAGMA table_info(cart_items);');
    const hasOwnerKey = columns.some((column) => column.name === 'owner_key');

    if (!hasOwnerKey) {
        await db.execAsync(
            `ALTER TABLE cart_items ADD COLUMN owner_key TEXT NOT NULL DEFAULT '${GUEST_OWNER_KEY}';`
        );
    }

    await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_cart_items_owner_sort
        ON cart_items (owner_key, sort_order);
    `);
};

export const getSavedCartItems = async (ownerKey) => {
    const db = await getDb();
    const userKey = getOwnerKey(ownerKey);

    const rows = await db.getAllAsync(
        'SELECT item_json FROM cart_items WHERE owner_key = ? ORDER BY sort_order ASC;',
        [userKey]
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

export const replaceSavedCartItems = async (ownerKey, items) => {
    const db = await getDb();
    const userKey = getOwnerKey(ownerKey);

    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM cart_items WHERE owner_key = ?;', [userKey]);

        for (let index = 0; index < items.length; index += 1) {
            await db.runAsync(
                'INSERT INTO cart_items (owner_key, sort_order, item_json) VALUES (?, ?, ?);',
                [userKey, index, JSON.stringify(items[index])]
            );
        }
    });
};

export const clearSavedCartItems = async (ownerKey) => {
    const db = await getDb();
    const userKey = getOwnerKey(ownerKey);

    await db.runAsync('DELETE FROM cart_items WHERE owner_key = ?;', [userKey]);
};
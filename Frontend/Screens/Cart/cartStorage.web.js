import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_OWNER_KEY = 'guest';
const CART_STORAGE_PREFIX = 'cart_items_owner_';

const getOwnerKey = (ownerKey) => {
    if (!ownerKey || typeof ownerKey !== 'string') {
        return GUEST_OWNER_KEY;
    }

    const normalizedKey = ownerKey.trim();
    return normalizedKey.length ? normalizedKey : GUEST_OWNER_KEY;
};

const getStorageKey = (ownerKey) => `${CART_STORAGE_PREFIX}${getOwnerKey(ownerKey)}`;

export const initCartTable = async () => {
    // No-op on web fallback storage.
};

export const getSavedCartItems = async (ownerKey) => {
    const raw = await AsyncStorage.getItem(getStorageKey(ownerKey));
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

export const replaceSavedCartItems = async (ownerKey, items) => {
    const safeItems = Array.isArray(items) ? items : [];
    await AsyncStorage.setItem(getStorageKey(ownerKey), JSON.stringify(safeItems));
};

export const clearSavedCartItems = async (ownerKey) => {
    await AsyncStorage.removeItem(getStorageKey(ownerKey));
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const JWT_KEY = 'jwt';

const isTokenExpired = (token) => {
    if (!token) {
        return true;
    }

    try {
        const decoded = jwtDecode(token);
        const exp = Number(decoded?.exp);
        if (!exp) {
            return false;
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return exp <= nowInSeconds;
    } catch (error) {
        return true;
    }
};

const secureStoreAvailable = async () => {
    try {
        return await SecureStore.isAvailableAsync();
    } catch (error) {
        return false;
    }
};

export const setJwtToken = async (token) => {
    if (!token) {
        await removeJwtToken();
        return;
    }

    const canUseSecureStore = await secureStoreAvailable();

    if (canUseSecureStore) {
        await SecureStore.setItemAsync(JWT_KEY, token);
        // Clean up any previous plain-text token storage.
        await AsyncStorage.removeItem(JWT_KEY);
        return;
    }

    await AsyncStorage.setItem(JWT_KEY, token);
};

export const getJwtToken = async () => {
    const canUseSecureStore = await secureStoreAvailable();

    if (canUseSecureStore) {
        const secureToken = await SecureStore.getItemAsync(JWT_KEY);
        if (secureToken) {
            if (isTokenExpired(secureToken)) {
                await removeJwtToken();
                return null;
            }
            return secureToken;
        }

        // One-time migration path for users that already have AsyncStorage tokens.
        const legacyToken = await AsyncStorage.getItem(JWT_KEY);
        if (legacyToken) {
            if (isTokenExpired(legacyToken)) {
                await removeJwtToken();
                return null;
            }
            await SecureStore.setItemAsync(JWT_KEY, legacyToken);
            await AsyncStorage.removeItem(JWT_KEY);
            return legacyToken;
        }

        return null;
    }

    const token = await AsyncStorage.getItem(JWT_KEY);
    if (isTokenExpired(token)) {
        await removeJwtToken();
        return null;
    }

    return token;
};

export const removeJwtToken = async () => {
    const canUseSecureStore = await secureStoreAvailable();

    if (canUseSecureStore) {
        await SecureStore.deleteItemAsync(JWT_KEY);
    }

    await AsyncStorage.removeItem(JWT_KEY);
};

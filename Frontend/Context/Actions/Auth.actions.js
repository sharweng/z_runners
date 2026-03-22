// import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import Toast from "react-native-toast-message"
import baseURL from "../../constants/baseurl"
import { removeJwtToken, setJwtToken } from "../../utils/tokenStorage"
import {
    createFirebaseUser,
    deleteFirebaseSessionUser,
    signInWithFirebaseEmail,
    signInWithGoogleCredential,
    signInWithFacebookCredential,
} from "../../utils/firebase"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

const exchangeFirebaseTokenForBackendSession = async ({ idToken, provider, name, email, image, phone, country }) => {
    const response = await fetch(`${baseURL}users/firebase-auth`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            idToken,
            provider,
            name,
            email,
            image,
            phone,
            country,
        }),
    });

    const raw = await response.text();
    let data = null;

    try {
        data = raw ? JSON.parse(raw) : null;
    } catch (error) {
        data = { message: raw || 'Authentication failed' };
    }

    if (!response.ok) {
        throw new Error(data?.message || 'Authentication failed');
    }

    if (!data?.token) {
        throw new Error('Authentication token is missing');
    }

    return data;
};

const finalizeSession = async (token, dispatch, profileSeed = {}) => {
    await setJwtToken(token)
    const decoded = jwtDecode(token)
    dispatch(setCurrentUser(decoded, profileSeed))
};

export const loginUser = (user, dispatch) => {
    const normalizedUser = {
        ...user,
        email: (user.email || '').trim().toLowerCase(),
    };

    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(normalizedUser),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then(async (res) => {
        const raw = await res.text();
        let data = null;

        try {
            data = raw ? JSON.parse(raw) : null;
        } catch (error) {
            data = { message: raw || 'Login failed' };
        }

        if (!res.ok) {
            const errorMessage = data?.message || data?.error || 'Please provide correct credentials';
            throw new Error(errorMessage);
        }

        return data;
    })
    .then(async (data) => {
        if (data?.token) {
            const token = data.token;
            await setJwtToken(token)
            const decoded = jwtDecode(token)
            dispatch(setCurrentUser(decoded, normalizedUser))
        } else {
           Toast.show({
               topOffset: 60,
               type: "error",
               text1: data?.message || "Please provide correct credentials",
               text2: ""
           });
           logoutUser(dispatch)
        }
    })
    .catch((err) => {
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: err?.message || "Please provide correct credentials",
            text2: ""
        });
        console.log(err)
        logoutUser(dispatch)
    });
};

export const loginWithFirebaseEmail = async ({ email, password }, dispatch) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    if (!normalizedEmail || !normalizedPassword) {
        throw new Error('Email and password are required');
    }

    const firebaseSession = await signInWithFirebaseEmail(normalizedEmail, normalizedPassword);
    const idToken = await firebaseSession.user.getIdToken();

    const response = await exchangeFirebaseTokenForBackendSession({
        idToken,
        provider: 'firebase-email',
        email: normalizedEmail,
        name: firebaseSession.user?.displayName || normalizedEmail.split('@')[0],
        image: firebaseSession.user?.photoURL || '',
        phone: firebaseSession.user?.phoneNumber || '',
    });

    await finalizeSession(response.token, dispatch, { email: normalizedEmail });
};

export const registerWithFirebaseEmail = async ({ email, password, name, phone, country }, dispatch) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    if (!normalizedEmail || !normalizedPassword) {
        throw new Error('Email and password are required');
    }

    const firebaseSession = await createFirebaseUser(normalizedEmail, normalizedPassword);

    try {
        const idToken = await firebaseSession.user.getIdToken();

        const response = await exchangeFirebaseTokenForBackendSession({
            idToken,
            provider: 'firebase-email',
            email: normalizedEmail,
            name,
            phone,
            country,
            image: firebaseSession.user?.photoURL || '',
        });

        await finalizeSession(response.token, dispatch, { email: normalizedEmail, name, phone, country });
    } catch (error) {
        try {
            await deleteFirebaseSessionUser(firebaseSession?.user);
        } catch (rollbackError) {
            console.log('Firebase register rollback failed', rollbackError?.message || rollbackError);
        }

        throw error;
    }
};

export const loginWithGoogle = async ({ idToken: googleIdToken }, dispatch) => {
    const firebaseSession = await signInWithGoogleCredential(googleIdToken);
    const firebaseIdToken = await firebaseSession.user.getIdToken();
    const response = await exchangeFirebaseTokenForBackendSession({
        idToken: firebaseIdToken,
        provider: 'google',
        email: firebaseSession.user?.email || '',
        name: firebaseSession.user?.displayName || '',
        image: firebaseSession.user?.photoURL || '',
        phone: firebaseSession.user?.phoneNumber || '',
    });

    await finalizeSession(response.token, dispatch, {
        email: firebaseSession.user?.email || '',
        name: firebaseSession.user?.displayName || '',
    });
};

export const loginWithFacebook = async ({ accessToken }, dispatch) => {
    const firebaseSession = await signInWithFacebookCredential(accessToken);
    const idToken = await firebaseSession.user.getIdToken();
    const response = await exchangeFirebaseTokenForBackendSession({
        idToken,
        provider: 'facebook',
        email: firebaseSession.user?.email || '',
        name: firebaseSession.user?.displayName || '',
        image: firebaseSession.user?.photoURL || '',
        phone: firebaseSession.user?.phoneNumber || '',
    });

    await finalizeSession(response.token, dispatch, {
        email: firebaseSession.user?.email || '',
        name: firebaseSession.user?.displayName || '',
    });
};

export const getUserProfile = (id) => {
    fetch(`${baseURL}users/${id}`, {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((data) => console.log(data));
}

export const logoutUser = (dispatch) => {
    removeJwtToken();
    dispatch(setCurrentUser({}))
}

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    }
}
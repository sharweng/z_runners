// import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import baseURL from "../../constants/baseurl"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

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
    .then((data) => {
        if (data?.token) {
            // console.log(data)
            const token = data.token;
            AsyncStorage.setItem("jwt", token)
            const decoded = jwtDecode(token)
            console.log("token",token)
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
    AsyncStorage.removeItem("jwt");
    dispatch(setCurrentUser({}))
}

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    }
}
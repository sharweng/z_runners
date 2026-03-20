import React, { useEffect, useReducer, useState } from "react";
// import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import AsyncStorage from '@react-native-async-storage/async-storage'

import authReducer from "../Reducers/Auth.reducer";
import { setCurrentUser } from "../Actions/Auth.actions";
import AuthGlobal from './AuthGlobal'

const Auth = props => {
    // console.log(props.children)
    const [stateUser, dispatch] = useReducer(authReducer, {
        isAuthenticated: null,
        user: {}
    });
    const [showChild, setShowChild] = useState(false);

    useEffect(() => {
        let isMounted = true;

        setShowChild(true);
        AsyncStorage.getItem("jwt")
            .then((token) => {
                if (token && isMounted) {
                    dispatch(setCurrentUser(jwtDecode(token)))
                }
            })
            .catch(() => {
                // Ignore storage parsing errors and keep user logged out.
            });

        return () => {
            isMounted = false;
            setShowChild(false);
        };
    }, [])


    if (!showChild) {
        return null;
    } else {
        return (
            <AuthGlobal.Provider
                value={{
                    stateUser,
                    dispatch
                }}
            >
                {props.children}
            </AuthGlobal.Provider>
        )
    }
};

export default Auth

import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import FormContainer from "../../Shared/FormContainer";
import { Ionicons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';

import AuthGlobal from '../../Context/Store/AuthGlobal'
import {
    loginUser,
    loginWithFirebaseEmail,
    loginWithGoogle,
    loginWithFacebook,
} from '../../Context/Actions/Auth.actions'
import Input from "../../Shared/Input";
import { colors, spacing } from "../../Shared/theme";

const createUnavailableAuthProvider = () => ({
    useAuthRequest: () => [null, null, async () => ({ type: 'unavailable' })],
});

let GoogleProvider = createUnavailableAuthProvider();
let FacebookProvider = createUnavailableAuthProvider();

try {
    const WebBrowser = require('expo-web-browser');
    WebBrowser.maybeCompleteAuthSession?.();
    GoogleProvider = require('expo-auth-session/providers/google');
    FacebookProvider = require('expo-auth-session/providers/facebook');
} catch (error) {
    console.log('Social auth temporarily disabled:', error?.message || error);
}

const Login = (props) => {
    const context = useContext(AuthGlobal)
    const navigation = useNavigation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const [googleRequest, googleResponse, promptGoogleAsync] = GoogleProvider.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || undefined,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
        scopes: ['profile', 'email'],
        responseType: 'id_token',
    });

    const [facebookRequest, facebookResponse, promptFacebookAsync] = FacebookProvider.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
        scopes: ['public_profile', 'email'],
        responseType: 'token',
    });

    const handleSubmit = async () => {
        const user = {
            email,
            password,
        };

        if (email === "" || password === "") {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Email and password are required',
            });
            return;
        }

        try {
            setLoading(true);
            await loginWithFirebaseEmail({ email, password }, context.dispatch);
        } catch (error) {
            const message = String(error?.message || 'Login failed');

            // Keep legacy login path as fallback for existing non-Firebase accounts.
            if (message.toLowerCase().includes('firebase client config is missing')) {
                loginUser(user, context.dispatch);
                return;
            }

            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Login failed',
                text2: message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (googleResponse?.type !== 'success') {
            return;
        }

        const idToken = googleResponse?.params?.id_token || googleResponse?.authentication?.idToken;
        if (!idToken) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Google login failed',
                text2: 'No ID token received',
            });
            return;
        }

        setLoading(true);
        loginWithGoogle({ idToken }, context.dispatch)
            .catch((error) => {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Google login failed',
                    text2: error?.message || 'Please try again',
                });
            })
            .finally(() => setLoading(false));
    }, [googleResponse]);

    useEffect(() => {
        if (facebookResponse?.type !== 'success') {
            return;
        }

        const accessToken = facebookResponse?.params?.access_token || facebookResponse?.authentication?.accessToken;
        if (!accessToken) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Facebook login failed',
                text2: 'No access token received',
            });
            return;
        }

        setLoading(true);
        loginWithFacebook({ accessToken }, context.dispatch)
            .catch((error) => {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Facebook login failed',
                    text2: error?.message || 'Please try again',
                });
            })
            .finally(() => setLoading(false));
    }, [facebookResponse]);

    useEffect(() => {
        if (context.stateUser.isAuthenticated === true) {
            const tabNavigation = navigation.getParent();
            const rootNavigation = tabNavigation?.getParent();

            if (context?.stateUser?.user?.isAdmin) {
                tabNavigation?.navigate('Admin', { screen: 'Products' });
                setTimeout(() => {
                    rootNavigation?.navigate('Zone Runners', {
                        screen: 'Admin',
                        params: { screen: 'Products' },
                    });
                }, 0);
                return;
            }

            tabNavigation?.navigate('Home', {
                screen: 'Main',
                params: {
                    openSearch: false,
                    headerSearchText: '',
                },
            });
        }
    }, [context.stateUser.isAuthenticated, context?.stateUser?.user?.isAdmin])

    const continueAsGuest = () => {
        navigation.navigate('Zone Runners', {
            screen: 'Home',
            params: {
                screen: 'Main',
                params: {
                    openSearch: false,
                    headerSearchText: '',
                },
            },
        });
    };

    return (
        <FormContainer title="Welcome back">
            <Input
                placeholder={"Enter email"}
                name={"email"}
                id={"email"}
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter Password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.passwordToggle}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color={colors.muted}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={[styles.actionButton, styles.loginButton, loading ? styles.disabledButton : null]} activeOpacity={0.85} onPress={() => handleSubmit()} disabled={loading}>
                    {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.loginButtonText}>LOGIN</Text>}
                </TouchableOpacity>
            </View>
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.googleButton]}
                    activeOpacity={0.85}
                    onPress={() => promptGoogleAsync({ useProxy: true })}
                    disabled={!googleRequest || loading}
                >
                    <Text style={styles.socialButtonText}>CONTINUE WITH GOOGLE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.facebookButton]}
                    activeOpacity={0.85}
                    onPress={() => promptFacebookAsync({ useProxy: true })}
                    disabled={!facebookRequest || loading}
                >
                    <Text style={[styles.socialButtonText, styles.socialButtonTextLight]}>CONTINUE WITH FACEBOOK</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonGroup}>
                <Text style={styles.middleText}>Dont' Have an Account yet?</Text>
                <TouchableOpacity style={[styles.actionButton, styles.registerButton]} activeOpacity={0.85} onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registerButtonText}>REGISTER</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={[styles.actionButton, styles.guestButton]} activeOpacity={0.85} onPress={continueAsGuest}>
                    <Text style={styles.guestButtonText}>CONTINUE AS GUEST</Text>
                </TouchableOpacity>
            </View>
        </FormContainer>
    )
}
const styles = StyleSheet.create({
    passwordContainer: {
        width: '100%',
        minHeight: 52,
        backgroundColor: colors.surface,
        marginVertical: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        color: colors.text,
        paddingVertical: spacing.md,
    },
    passwordToggle: {
        paddingLeft: spacing.sm,
        paddingVertical: spacing.xs,
    },
    buttonGroup: {
        width: "100%",
        alignItems: "center",
        marginTop: spacing.sm,
    },
    actionButton: {
        width: '100%',
        minHeight: 44,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    registerButton: {
        backgroundColor: colors.surface,
        borderColor: colors.primary,
    },
    guestButton: {
        backgroundColor: colors.surfaceSoft,
        borderColor: colors.border,
    },
    googleButton: {
        marginBottom: spacing.sm,
        backgroundColor: '#ffffff',
        borderColor: colors.border,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
    },
    loginButtonText: {
        color: colors.surface,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    socialButtonText: {
        color: colors.text,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    socialButtonTextLight: {
        color: '#ffffff',
    },
    registerButtonText: {
        color: colors.primary,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    guestButtonText: {
        color: colors.text,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    middleText: {
        marginVertical: spacing.md,
        alignSelf: "center",
        color: colors.primary,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.75,
    },
});
export default Login;
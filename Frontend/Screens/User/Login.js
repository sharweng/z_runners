
import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import FormContainer from "../../Shared/FormContainer";
import { Ionicons } from "@expo/vector-icons";

import AuthGlobal from '../../Context/Store/AuthGlobal'
import { loginUser } from '../../Context/Actions/Auth.actions'
import Input from "../../Shared/Input";
import { colors, spacing } from "../../Shared/theme";

const Login = (props) => {
    const context = useContext(AuthGlobal)
    const navigation = useNavigation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const handleSubmit = () => {
        const user = {
            email,
            password,
        };

        if (email === "" || password === "") {
            return;
        } else {
            loginUser(user, context.dispatch);
            // console.log("error")
        }
    };

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
                <TouchableOpacity style={[styles.actionButton, styles.loginButton]} activeOpacity={0.85} onPress={() => handleSubmit()}>
                    <Text style={styles.loginButtonText}>LOGIN</Text>
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
    loginButtonText: {
        color: colors.surface,
        fontWeight: '800',
        letterSpacing: 0.8,
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
});
export default Login;
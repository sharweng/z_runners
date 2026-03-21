
import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native'
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
                <Button color={colors.accent} title="Login"
                    onPress={() => handleSubmit()} />
            </View>
            <View style={styles.buttonGroup}>
                <Text style={styles.middleText}>Dont' Have an Account yet?</Text>
                <Button color={colors.primary} title="Register" onPress={() => navigation.navigate("Register")} />
            </View>
            <View style={styles.buttonGroup}>
                <Button color={colors.muted} title="Continue as Guest" onPress={continueAsGuest} />
            </View>
        </FormContainer>
    )
}
const styles = StyleSheet.create({
    passwordContainer: {
        width: '100%',
        minHeight: 56,
        backgroundColor: colors.surface,
        marginVertical: spacing.sm,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.lg,
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
    middleText: {
        marginVertical: spacing.md,
        alignSelf: "center",
        color: colors.muted,
    },
});
export default Login;
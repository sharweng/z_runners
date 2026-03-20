
import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import FormContainer from "../../Shared/FormContainer";

import AuthGlobal from '../../Context/Store/AuthGlobal'
import { loginUser } from '../../Context/Actions/Auth.actions'
import Input from "../../Shared/Input";
import { colors, spacing } from "../../Shared/theme";

const Login = (props) => {
    const context = useContext(AuthGlobal)
    const navigation = useNavigation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
            navigation.navigate("User Profile")
        }
    }, [context.stateUser.isAuthenticated])

    return (
        <FormContainer title="Welcome back">
            <Input
                placeholder={"Enter email"}
                name={"email"}
                id={"email"}
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
            />
            <Input
                placeholder={"Enter Password"}
                name={"password"}
                id={"password"}
                secureTextEntry={true}
                value={password}
                onChangeText={(text) => setPassword(text)}
            />
            <View style={styles.buttonGroup}>
                <Button color={colors.accent} title="Login"
                    onPress={() => handleSubmit()} />
            </View>
            <View style={styles.buttonGroup}>
                <Text style={styles.middleText}>Dont' Have an Account yet?</Text>
                <Button color={colors.primary} title="Register" onPress={() => navigation.navigate("Register")} />
            </View>
        </FormContainer>
    )
}
const styles = StyleSheet.create({
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
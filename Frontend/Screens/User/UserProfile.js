import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
// import { Container } from "native-base"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

import AsyncStorage from '@react-native-async-storage/async-storage'

import axios from "axios"
import baseURL from "../../constants/baseurl"

import AuthGlobal from "../../Context/Store/AuthGlobal"
import { logoutUser } from "../../Context/Actions/Auth.actions"
import { colors, radius, shadow, spacing } from "../../Shared/theme";


const UserProfile = (props) => {
    const context = useContext(AuthGlobal)
    const [userProfile, setUserProfile] = useState('')
    const [orders, setOrders] = useState([])
    const navigation = useNavigation()

    useFocusEffect(
        useCallback(() => {
            if (
                context.stateUser.isAuthenticated === false ||
                context.stateUser.isAuthenticated === null
            ) {
                navigation.navigate("Login")
            }
            // console.log(context.stateUser.user)
            AsyncStorage.getItem("jwt")
                .then((res) => {
                    axios
                        .get(`${baseURL}users/${context.stateUser.user.userId}`, {
                            headers: { Authorization: `Bearer ${res}` },
                        })
                        .then((user) => setUserProfile(user.data))
                })
                .catch((error) => console.log(error))
            return () => {
                setUserProfile();
            }

        }, [context.stateUser.isAuthenticated]))

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.subContainer}>
                <Text style={styles.name}>
                    {userProfile ? userProfile.name : ""}
                </Text>
                <View style={styles.card}>
                    <Text style={styles.info}>
                        Email: {userProfile ? userProfile.email : ""}
                    </Text>
                    <Text style={styles.info}>
                        Phone: {userProfile ? userProfile.phone : ""}
                    </Text>
                </View>
                <View style={styles.buttonWrap}>
                    <Button color={colors.danger} title={"Sign Out"} onPress={() => [
                        AsyncStorage.removeItem("jwt"),
                        logoutUser(context.dispatch)
                    ]} />
                </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: colors.background,
    },
    subContainer: {
        alignItems: "center",
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.lg,
        width: '100%',
    },
    name: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        ...shadow,
    },
    info: {
        marginVertical: spacing.sm,
        color: colors.text,
        fontSize: 15,
    },
    buttonWrap: {
        marginTop: 40,
        alignItems: "center",
    }
})

export default UserProfile
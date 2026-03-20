import React, { useState, useContext } from 'react'
import { View, StyleSheet, Dimensions, ScrollView, Button, Text } from "react-native";
import { Surface, Avatar, Divider } from 'react-native-paper';


import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux'
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from 'axios';
import baseURL from '../../constants/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
var { width, height } = Dimensions.get("window");
import Toast from 'react-native-toast-message';
import { clearCart } from '../../Redux/Actions/cartActions';
import { colors, radius, shadow, spacing } from '../../Shared/theme';
import { clearSavedCartItems } from '../Cart/cartStorage';
const Confirm = (props) => {
    const context = useContext(AuthGlobal)
    // const confirm = props.route.params;
    const finalOrder = props.route.params;
    console.log("order", finalOrder)
    const dispatch = useDispatch()
    let navigation = useNavigation()

    const confirmOrder = () => {
        const order = finalOrder.order.order;

        AsyncStorage.getItem("jwt")
            .then((res) => {
                const config = {
                    headers: {
                        Authorization: `Bearer ${res}`
                    }
                }

                return axios.post(`${baseURL}orders`, order, config)
            })
            .then(async (res) => {
                console.log(res.status)
                await clearSavedCartItems();
                Toast.show({
                    topOffset: 60,
                    type: "success",
                    text1: "Order Completed",
                    text2: "",
                });
                setTimeout(() => {
                    dispatch(clearCart())
                    navigation.navigate('Cart Screen', { screen: 'Cart' })
                }, 500);
            })
            .catch((error) => {
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "Something went wrong",
                    text2: "Please try again",
                });
            });
    }


    return (
        <Surface style={styles.surface}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Confirm Order</Text>
                    {props.route.params ? (
                        <View style={styles.card}>
                            <Text style={styles.title}>Shipping to:</Text>
                            <View style={styles.cardBody}>
                                <Text>Address: {finalOrder.order.order.shippingAddress1}</Text>
                                <Text>Address2: {finalOrder.order.order.shippingAddress2}</Text>
                                <Text>City: {finalOrder.order.order.city}</Text>
                                <Text>Zip Code: {finalOrder.order.order.zip}</Text>
                                <Text>Country: {finalOrder.order.order.country}</Text>
                            </View>
                            <Text style={styles.title}>items</Text>

                            {finalOrder.order.order.orderItems.map((item) => {
                                return (
                                    <Surface key={item.id} style={styles.itemCard}>

                                        <Avatar.Image size={48} source={{
                                            uri: item.image ?
                                                item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                                        }} />

                                        <Text style={styles.itemName}>
                                            {item.name}
                                        </Text>

                                        <Divider />
                                        <Text style={styles.itemPrice}>
                                            $ {item.price}
                                        </Text>


                                    </Surface>
                                )
                            })}
                        </View>
                    ) : null}
                    <View style={{ alignItems: "center", margin: 20 }}>
                        <Button
                            color={colors.primary}
                            title={"Place order"}
                            onPress={confirmOrder}
                        />
                    </View>
                </View>
            </ScrollView>
        </Surface>
    )

}
const styles = StyleSheet.create({
    surface: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        minHeight: height,
        padding: spacing.lg,
        alignContent: "center",
        backgroundColor: colors.background,
    },
    titleContainer: {
        justifyContent: "center",
        alignItems: "center",
        margin: 8,
    },
    title: {
        alignSelf: "center",
        margin: 8,
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
    },
    card: {
        width: width / 1.05,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: spacing.md,
        ...shadow,
    },
    cardBody: {
        margin: 10,
        alignItems: "center",
        flexDirection: "column",
        width: "90%",
    },
    itemCard: {
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceSoft,
    },
    itemName: {
        fontWeight: '700',
        color: colors.text,
        marginTop: spacing.sm,
    },
    itemPrice: {
        color: colors.primary,
        fontWeight: '700',
    },
});
export default Confirm;
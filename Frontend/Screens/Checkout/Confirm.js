import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { View, StyleSheet, Dimensions, ScrollView, Button, Text, ActivityIndicator } from "react-native";
import { Surface, Avatar, Divider } from 'react-native-paper';


import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux'
import AuthGlobal from '../../Context/Store/AuthGlobal';
var { width, height } = Dimensions.get("window");
import Toast from 'react-native-toast-message';
import { clearCart } from '../../Redux/Actions/cartActions';
import { createOrder } from '../../Redux/Actions/orderActions';
import { colors, radius, shadow, spacing } from '../../Shared/theme';
import { clearSavedCartItems } from '../Cart/cartStorage';
import { getJwtToken } from '../../utils/tokenStorage';
const Confirm = (props) => {
    const context = useContext(AuthGlobal)
    const order = props?.route?.params?.order;
    const quote = props?.route?.params?.quote;
    const paymentMethod = props?.route?.params?.paymentMethod;
    const paymentToken = props?.route?.params?.paymentToken;
    const dispatch = useDispatch()
    const cartItems = useSelector((state) => state.cartItems);
    const { creating, error: orderCreateError } = useSelector((state) => state.orders);
    let navigation = useNavigation()
    const didShowEmptyToastRef = useRef(false);

    const liveOrder = useMemo(() => {
        if (!order) {
            return null;
        }

        return {
            ...order,
            orderItems: Array.isArray(cartItems) ? cartItems : [],
        };
    }, [order, cartItems]);

    const hasOrderItems = Array.isArray(liveOrder?.orderItems) && liveOrder.orderItems.length > 0;

    useEffect(() => {
        if (!order || hasOrderItems || didShowEmptyToastRef.current) {
            return;
        }

        didShowEmptyToastRef.current = true;
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "Your cart is empty",
            text2: "Checkout confirmation was cleared.",
        });
        navigation.navigate('Cart Screen', { screen: 'Cart' });
    }, [order, hasOrderItems, navigation]);

    const confirmOrder = async () => {
        if (creating) {
            return;
        }

        if (!liveOrder || !hasOrderItems) {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Missing order data",
                text2: "Please add items and restart checkout",
            });
            return;
        }

        try {
            const token = await getJwtToken();
            if (!token) {
                throw new Error('Please login to place an order');
            }

            const resolvedPaymentMethod = paymentMethod || 'Cash on Delivery';
            const resolvedPaymentToken = paymentToken || `offline_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

            await dispatch(createOrder({
                ...liveOrder,
                paymentMethod: resolvedPaymentMethod,
                paymentToken: resolvedPaymentToken,
                idempotencyKey: `${liveOrder?.user || 'guest'}-${Date.now()}`,
            }, token));
            const ownerKey = context?.stateUser?.user?.userId
                ? `user:${context.stateUser.user.userId}`
                : 'guest';
            await clearSavedCartItems(ownerKey);
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
        } catch (error) {
            if (error?.code === 'ECONNABORTED') {
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "Network timeout",
                    text2: "Order processing is taking longer than expected. Please check My Orders.",
                });
                return;
            }

            const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Please try again';
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Something went wrong",
                text2: `${message}`,
            });
        }
    }


    return (
        <Surface style={styles.surface}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Confirm Order</Text>
                    {liveOrder && hasOrderItems ? (
                        <View style={styles.card}>
                            <Text style={styles.title}>Shipping to:</Text>
                            <View style={styles.cardBody}>
                                <Text>Address: {liveOrder.shippingAddress1}</Text>
                                <Text>Address2: {liveOrder.shippingAddress2}</Text>
                                <Text>City: {liveOrder.city}</Text>
                                <Text>Zip Code: {liveOrder.zip}</Text>
                                <Text>Country: {liveOrder.country}</Text>
                            </View>
                            <Text style={styles.title}>items</Text>

                            {liveOrder.orderItems?.map((item) => {
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
                                            $ {(Number(item?.price) || 0).toFixed(2)} x {Number(item?.quantity) || 1}
                                        </Text>


                                    </Surface>
                                )
                            })}
                            <View style={styles.summaryWrap}>
                                <Text style={styles.summaryText}>Subtotal: $ {Number(quote?.subtotal || 0).toFixed(2)}</Text>
                                <Text style={styles.summaryText}>Tax: $ {Number(quote?.taxAmount || 0).toFixed(2)}</Text>
                                <Text style={styles.summaryText}>Shipping: $ {Number(quote?.shippingFee || 0).toFixed(2)}</Text>
                                <Text style={styles.summaryTotal}>Total: $ {Number(quote?.totalPrice || 0).toFixed(2)}</Text>
                                <Text style={styles.paymentMeta}>Payment: {paymentMethod || 'Card'}</Text>
                            </View>
                        </View>
                    ) : null}
                    {orderCreateError ? (
                        <Text style={styles.errorText}>
                            Failed to place order. Please retry.
                        </Text>
                    ) : null}
                    <View style={{ alignItems: "center", margin: 20 }}>
                        <Button
                            color={colors.primary}
                            title={creating ? "Placing order..." : "Place order"}
                            onPress={confirmOrder}
                            disabled={creating || !hasOrderItems}
                        />
                        {creating ? (
                            <ActivityIndicator style={styles.loadingIndicator} size="small" color={colors.primary} />
                        ) : null}
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
    summaryWrap: {
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
    },
    summaryText: {
        color: colors.text,
        marginBottom: 4,
    },
    summaryTotal: {
        color: colors.primary,
        fontWeight: '800',
        marginTop: 4,
    },
    paymentMeta: {
        color: colors.muted,
        marginTop: 6,
    },
    errorText: {
        color: colors.danger,
        fontWeight: '700',
        marginTop: spacing.md,
    },
    loadingIndicator: {
        marginTop: spacing.sm,
    },
});
export default Confirm;
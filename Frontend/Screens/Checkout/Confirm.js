import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux'
import AuthGlobal from '../../Context/Store/AuthGlobal';
import Toast from 'react-native-toast-message';
import { clearCart } from '../../Redux/Actions/cartActions';
import { createOrder } from '../../Redux/Actions/orderActions';
import { colors, spacing } from '../../Shared/theme';
import { clearSavedCartItems } from '../Cart/cartStorage';
import { getJwtToken } from '../../utils/tokenStorage';
import FormContainer from '../../Shared/FormContainer';

const getItemId = (item, index) => String(item?.id || item?._id || item?.product || `item-${index}`);
const getItemImage = (item) => item?.image || item?.product?.image || 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
const formatDateTime = (value) => {
    const parsed = new Date(value || Date.now());
    if (Number.isNaN(parsed.getTime())) {
        return 'N/A';
    }

    return parsed.toLocaleString();
};

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
    const draftRef = `DRAFT-${String(liveOrder?.user || 'GUEST').slice(-6).toUpperCase()}`;

    const renderKeyValueRow = (label, value, isStrong = false) => (
        <View style={styles.kvRow}>
            <Text style={[styles.kvLabel, isStrong && styles.kvStrong]}>{label}</Text>
            <Text style={[styles.kvValue, isStrong && styles.kvStrong]} numberOfLines={2} ellipsizeMode="tail">{value}</Text>
        </View>
    );

    const navigateToHome = () => {
        const homeParams = {
            screen: 'Main',
            params: {
                openSearch: false,
                headerSearchText: '',
            },
        };

        const parentNav = navigation.getParent();
        const rootNav = parentNav?.getParent();

        parentNav?.navigate?.('Home', homeParams);
        rootNav?.navigate?.('Zone Runners', { screen: 'Home', params: homeParams });
        navigation.navigate('Zone Runners', { screen: 'Home', params: homeParams });
    };

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
                navigateToHome();
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
        <FormContainer title={'Confirm Order'}>
            {liveOrder && hasOrderItems ? (
                <View style={styles.detailsWrap}>
                    <View style={styles.receiptMetaBlock}>
                        <View style={styles.receiptMetaRow}>
                            <Text style={styles.receiptMetaLabel}>Ref No.</Text>
                            <Text style={styles.receiptMetaValue}>{draftRef}</Text>
                        </View>
                        <View style={styles.receiptMetaRow}>
                            <Text style={styles.receiptMetaLabel}>Date</Text>
                            <Text style={styles.receiptMetaValue}>{formatDateTime(liveOrder?.dateOrdered)}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Shipping to:</Text>
                    <View style={styles.cardBody}>
                        {renderKeyValueRow('Address', liveOrder.shippingAddress1 || '-')}
                        {renderKeyValueRow('Address 2', liveOrder.shippingAddress2 || '-')}
                        {renderKeyValueRow('City', liveOrder.city || '-')}
                        {renderKeyValueRow('Zip Code', liveOrder.zip || '-')}
                        {renderKeyValueRow('Country', liveOrder.country || '-')}
                    </View>

                    <Text style={styles.sectionTitle}>Items</Text>
                    <View style={styles.itemHeaderRow}>
                        <Text style={[styles.itemHeaderText, styles.itemNameCol]}>Item</Text>
                        <Text style={[styles.itemHeaderText, styles.itemQtyCol]}>Qty</Text>
                        <Text style={[styles.itemHeaderText, styles.itemPriceCol]}>Price</Text>
                    </View>

                    {liveOrder.orderItems?.map((item, index) => (
                        <Surface key={getItemId(item, index)} style={styles.itemCard}>
                            <Image source={{ uri: getItemImage(item) }} style={styles.itemImage} resizeMode="cover" />
                            <Text style={[styles.itemName, styles.itemNameCol]} numberOfLines={1} ellipsizeMode="tail">
                                {item?.name || 'Product'}
                            </Text>
                            <Text style={[styles.itemMeta, styles.itemQtyCol]}>
                                {Number(item?.quantity) || 1}
                            </Text>
                            <Text style={[styles.itemPrice, styles.itemPriceCol]}>
                                $ {(Number(item?.price) || 0).toFixed(2)}
                            </Text>
                        </Surface>
                    ))}

                    <View style={styles.summaryWrap}>
                        {renderKeyValueRow('Subtotal', `$ ${Number(quote?.subtotal || 0).toFixed(2)}`)}
                        {renderKeyValueRow('Discount', `-$ ${Number(quote?.discountAmount || 0).toFixed(2)}`)}
                        {renderKeyValueRow('Shipping', `$ ${Number(quote?.shippingFee || 0).toFixed(2)}`)}
                        {renderKeyValueRow('Total', `$ ${Number(quote?.totalPrice || 0).toFixed(2)}`, true)}
                        {renderKeyValueRow('Payment', paymentMethod || 'Card')}
                    </View>

                    {orderCreateError ? (
                        <Text style={styles.errorText}>
                            Failed to place order. Please retry.
                        </Text>
                    ) : null}

                    <View style={styles.actionWrap}>
                        <TouchableOpacity
                            style={[styles.actionButton, creating && styles.actionButtonDisabled]}
                            onPress={confirmOrder}
                            disabled={creating || !hasOrderItems}
                        >
                            <Text style={styles.actionButtonText}>{creating ? 'PLACING ORDER...' : 'PLACE ORDER'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={() => navigation.navigate('Payment', { order, quote, paymentMethod, paymentToken })}
                            disabled={creating}
                        >
                            <Text style={styles.secondaryButtonText}>BACK TO PAYMENT</Text>
                        </TouchableOpacity>
                        {creating ? (
                            <ActivityIndicator style={styles.loadingIndicator} size="small" color={colors.primary} />
                        ) : null}
                    </View>
                </View>
            ) : null}
        </FormContainer>
    )

}
const styles = StyleSheet.create({
    detailsWrap: {
        width: '100%',
    },
    sectionTitle: {
        alignSelf: 'center',
        marginBottom: spacing.sm,
        marginTop: spacing.md,
        fontSize: 18,
        fontWeight: "800",
        color: colors.primary,
    },
    receiptMetaBlock: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    receiptMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    receiptMetaLabel: {
        color: colors.muted,
        fontWeight: '700',
    },
    receiptMetaValue: {
        color: colors.text,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
    },
    cardBody: {
        marginTop: spacing.sm,
        width: '100%',
    },
    kvRow: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'flex-start',
    },
    kvLabel: {
        width: 108,
        color: colors.muted,
        fontWeight: '700',
    },
    kvValue: {
        flex: 1,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'right',
        fontVariant: ['tabular-nums'],
    },
    kvStrong: {
        color: colors.primary,
        fontWeight: '800',
    },
    itemHeaderRow: {
        marginTop: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
        paddingBottom: spacing.xs,
        flexDirection: 'row',
    },
    itemHeaderText: {
        color: colors.muted,
        fontWeight: '800',
        textAlign: 'center',
    },
    itemCard: {
        marginTop: spacing.md,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSoft,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginRight: spacing.sm,
    },
    itemNameCol: {
        flex: 1,
        paddingRight: 8,
    },
    itemQtyCol: {
        width: 48,
        textAlign: 'center',
    },
    itemPriceCol: {
        width: 96,
        textAlign: 'center',
    },
    itemName: {
        fontWeight: '700',
        color: colors.text,
    },
    itemMeta: {
        color: colors.text,
        fontWeight: '600',
    },
    itemPrice: {
        color: colors.primary,
        fontWeight: '700',
    },
    summaryWrap: {
        marginTop: spacing.md,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        paddingTop: spacing.xs,
    },
    errorText: {
        color: colors.danger,
        fontWeight: '700',
        marginTop: spacing.md,
    },
    loadingIndicator: {
        marginTop: spacing.sm,
    },
    actionWrap: {
        width: '100%',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        gap: spacing.sm,
    },
    actionButton: {
        width: '100%',
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    actionButtonDisabled: {
        opacity: 0.7,
    },
    actionButtonText: {
        color: colors.surface,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.text,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
});
export default Confirm;
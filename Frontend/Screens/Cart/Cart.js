import React, { useCallback, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native'


import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { removeFromCart, clearCart, updateCartQuantity } from '../../Redux/Actions/cartActions'
import { Surface } from 'react-native-paper';
var { height, width } = Dimensions.get("window");
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from '../../Shared/theme';
import Toast from 'react-native-toast-message';
import AuthGlobal from '../../Context/Store/AuthGlobal';

const Cart = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const cartItems = useSelector(state => state.cartItems)
    const context = useContext(AuthGlobal);

    useFocusEffect(
        useCallback(() => {
            if (context?.stateUser?.isAuthenticated) {
                return;
            }

            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Please login first',
                text2: 'Sign in to access your cart.',
            });
            navigation.navigate('User', { screen: 'Login' });
        }, [context?.stateUser?.isAuthenticated, navigation])
    );

    var total = 0;
    cartItems.forEach(cart => {
        const price = Number(cart?.price) || 0;
        const quantity = Number(cart?.quantity) || 1;
        return (total += (price * quantity))
    });

    const increaseQuantity = (item) => {
        const current = Number(item?.quantity) || 1;
        dispatch(updateCartQuantity(item.id || item._id || item.product, current + 1));
    };

    const decreaseQuantity = (item) => {
        const current = Number(item?.quantity) || 1;
        if (current <= 1) {
            dispatch(removeFromCart(item));
            return;
        }

        dispatch(updateCartQuantity(item.id || item._id || item.product, current - 1));
    };

    const removeItem = (item) => {
        dispatch(removeFromCart(item));
    };

    const renderItem = ({ item, index }) =>
            <Surface style={styles.card}>

                <Image
                    style={styles.itemImage}
                    source={{
                        uri: item.image ?
                            item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                    }}
                />

                <Text style={styles.itemName}>
                    {item.name}
                </Text>

                <View style={styles.qtyWrap}>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQuantity(item)}>
                        <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{Number(item?.quantity) || 1}</Text>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQuantity(item)}>
                        <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.price}>
                    $ {(Number(item?.price) || 0).toFixed(2)}
                </Text>


            </Surface>
        ;

    const renderHiddenItem = ({ item }) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={styles.backRightBtn}
                onPress={() => removeItem(item)}
            >
                <Ionicons name="trash" color="white" size={20} />
                <Text style={styles.backText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const handleCheckout = () => {
        if (!cartItems.length) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Your cart is empty',
                text2: 'Add products before checkout',
            });
            return;
        }

        if (!context?.stateUser?.isAuthenticated) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Please Login to Checkout',
                text2: '',
            });
            navigation.navigate('User', { screen: 'Login' });
            return;
        }

        navigation.navigate('Checkout');
    };

    return (
        <>
            {cartItems.length > 0 ? (
                <Surface style={styles.listSurface} >
                    <SwipeListView
                        data={cartItems}
                        renderItem={renderItem}
                        renderHiddenItem={renderHiddenItem}
                        disableRightSwipe={true}
                        disableLeftSwipe={false}
                        leftOpenValue={0}
                        rightOpenValue={-88}
                        stopRightSwipe={-88}
                        directionalDistanceChangeThreshold={4}
                        swipeToOpenPercent={15}
                        swipeToClosePercent={20}
                        swipeToOpenVelocityContribution={8}
                        closeOnRowPress={true}
                        closeOnScroll={true}
                        previewOpenValue={-88}
                        previewOpenDelay={1200}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item, index) =>
                            String(item?.id || item?._id?.$oid || item?._id || item?.product || index)
                        }
                    />
                </Surface>
            ) : (
                <Surface style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No items in cart
                    </Text>
                </Surface>
            )}
            <View style={styles.bottomContainer}
            >
                <View style={styles.totalWrap}>
                    <Text style={styles.price}>$ {total.toFixed(2)}</Text>
                </View>
                <View style={styles.actionWrap}>
                    <TouchableOpacity
                        style={[styles.bottomButton, styles.clearButton]}
                        onPress={() => dispatch(clearCart())}
                    >
                        <Text style={styles.bottomButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.actionWrap}>

                    <TouchableOpacity
                        style={[styles.bottomButton, styles.checkoutButton]}
                        onPress={handleCheckout}
                    >
                        <Text style={styles.bottomButtonText}>Check Out</Text>
                    </TouchableOpacity>
                </View>

            </View >
        </>
    )
}

const styles = StyleSheet.create({
    emptyContainer: {
        height: height,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
    },
    emptyText: {
        color: colors.muted,
        fontSize: 16,
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 18,
        margin: 20,
        color: colors.primary,
        fontWeight: '800',
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: colors.background,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
    },
    backRightBtn: {
        width: 88,
        height: '100%',
        backgroundColor: colors.danger,
        borderWidth: 2,
        borderColor: colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: {
        color: 'white',
        fontWeight: '700',
        marginTop: 4,
    },
    listSurface: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.background,
    },
    listContent: {
        paddingBottom: 90,
    },
    card: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    qtyWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
        marginRight: spacing.sm,
    },
    qtyButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.surfaceSoft,
    },
    qtyButtonText: {
        color: colors.text,
        fontWeight: '800',
    },
    qtyValue: {
        minWidth: 28,
        textAlign: 'center',
        color: colors.text,
        fontWeight: '700',
    },
    itemName: {
        flex: 1,
        color: colors.text,
        fontWeight: '700',
    },
    itemImage: {
        width: 52,
        height: 52,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSoft,
    },
    totalWrap: {
        minWidth: 90,
    },
    actionWrap: {
        marginLeft: spacing.sm,
    },
    bottomButton: {
        minWidth: 88,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 2,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
    },
    checkoutButton: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    bottomButtonText: {
        color: 'white',
        fontWeight: '700',
    },
});
export default Cart
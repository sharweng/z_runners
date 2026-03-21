import React, { useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Text, View, TouchableHighlight, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'


import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome";
import { SwipeListView } from 'react-native-swipe-list-view';
import { removeFromCart, clearCart } from '../../Redux/Actions/cartActions'
import { Surface, Divider, Avatar, Button } from 'react-native-paper';
var { height, width } = Dimensions.get("window");
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from '../../Shared/theme';
import Toast from 'react-native-toast-message';
import AuthGlobal from '../../Context/Store/AuthGlobal';

const Cart = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const cartItems = useSelector(state => state.cartItems)
    const context = useContext(AuthGlobal);

    var total = 0;
    console.log("cart", cartItems)
    cartItems.forEach(cart => {
        return (total += cart.price)
    });
    const renderItem = ({ item, index }) =>
        <TouchableHighlight>
            <Surface style={styles.card}>

                <Avatar.Image size={48} source={{
                    uri: item.image ?
                        item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                }} />

                <Text style={styles.itemName}>
                    {item.name}
                </Text>

                <Divider />
                <Text style={styles.price}>
                    $ {item.price}
                </Text>


            </Surface>
        </TouchableHighlight>;

    const renderHiddenItem = (cartItems) =>
        <TouchableOpacity
            onPress={() => dispatch(removeFromCart(cartItems.item))}
        >
            <Surface style={styles.hiddenButton} >
                <View >
                    <Ionicons name="trash" color={"white"} size={30} bg="red" />
                    <Text color="white" fontSize="xs" fontWeight="medium">
                        Delete
                    </Text>
                </View>
            </Surface>

        </TouchableOpacity>;

    const handleCheckout = () => {
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
                        leftOpenValue={75}
                        rightOpenValue={-200}
                        previewOpenValue={-100}
                        previewOpenDelay={3000}
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
                    <Button
                        mode="contained"
                        buttonColor={colors.danger}
                        onPress={() => dispatch(clearCart())} >Clear</Button>
                </View>
                <View style={styles.actionWrap}>

                    <Button
                        mode="contained"
                        buttonColor={colors.success}
                        onPress={handleCheckout}>Check Out</Button>
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
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        justifyContent: 'space-between',
        ...shadow,
    },
    price: {
        fontSize: 18,
        margin: 20,
        color: colors.primary,
        fontWeight: '800',
    },
    hiddenButton: {
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 25,
        height: 84,
        width: width / 1.2,
        borderRadius: radius.md,
    },
    listSurface: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.background,
    },
    card: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...shadow,
    },
    itemName: {
        flex: 1,
        color: colors.text,
        fontWeight: '700',
    },
    totalWrap: {
        minWidth: 90,
    },
    actionWrap: {
        marginLeft: spacing.sm,
    }
});
export default Cart
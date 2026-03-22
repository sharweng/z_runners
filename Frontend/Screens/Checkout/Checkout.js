import React, { useEffect, useState, useContext } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'

import FormContainer from '../../Shared/FormContainer'
import Input from '../../Shared/Input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import baseURL from '../../constants/baseurl'

const countries = require("../../data/countries.json");
import AuthGlobal from '../../Context/Store/AuthGlobal'
import Toast from 'react-native-toast-message'
import { colors, spacing } from '../../Shared/theme'
import { replaceSavedCartItems } from '../Cart/cartStorage';
import { getJwtToken } from '../../utils/tokenStorage';
import { fetchCheckoutQuote } from '../../Redux/Actions/orderActions';

const Checkout = (props) => {
    const [user, setUser] = useState('')
    const [orderItems, setOrderItems] = useState([])
    const [address, setAddress] = useState('')
    const [address2, setAddress2] = useState('')
    const [city, setCity] = useState('')
    const [zip, setZip] = useState('')
    const [country, setCountry] = useState('Philippines')
    const [phone, setPhone] = useState('')
    const [discountCode, setDiscountCode] = useState('')
    const [discountPreview, setDiscountPreview] = useState(null)

    const navigation = useNavigation()
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cartItems)
    const { quoteLoading } = useSelector((state) => state.orders);
    const context = useContext(AuthGlobal);
    useEffect(() => {
        setOrderItems(cartItems)
        if (context.stateUser.isAuthenticated) {
            setUser(context.stateUser.user.userId)
        } else {
            navigation.navigate("User", { screen: 'Login' });
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Please Login to Checkout",
                text2: ""
            });
        }

        if (cartItems.length === 0) {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Your cart is empty",
                text2: "Add products before checkout",
            });
            navigation.navigate('Cart Screen', { screen: 'Cart' });
        }

        return () => {
            setOrderItems();
        }
    }, [])

    useEffect(() => {
        if (!context.stateUser.isAuthenticated || !context?.stateUser?.user?.userId) {
            return;
        }

        let isMounted = true;

        const loadProfileIntoCheckout = async () => {
            try {
                const token = await getJwtToken();
                if (!token) {
                    return;
                }

                const response = await axios.get(
                    `${baseURL}users/${context.stateUser.user.userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!isMounted || !response?.data) {
                    return;
                }

                const profile = response.data;
                setPhone(profile.phone || '');
                setAddress(profile.street || '');
                setAddress2(profile.apartment || '');
                setCity(profile.city || '');
                setZip(profile.zip || '');
                setCountry(profile.country || 'Philippines');
            } catch (error) {
                // Keep manual checkout fields editable when profile fetch fails.
            }
        };

        loadProfileIntoCheckout();

        return () => {
            isMounted = false;
        };
    }, [context?.stateUser?.isAuthenticated, context?.stateUser?.user?.userId]);

    const requestQuote = async (shouldNavigate) => {
        const token = await getJwtToken();
        const quote = await dispatch(fetchCheckoutQuote({
            orderItems,
            discountCode: discountCode.trim().toUpperCase(),
        }, token));

        setDiscountPreview(quote || null);

        if (quote?.discountError) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Discount not applied',
                text2: quote.discountError,
            });
        } else if (quote?.discountAmount > 0) {
            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: 'Discount applied',
                text2: `${quote.discountCode} saved PHP ${Number(quote.discountAmount).toFixed(2)}`,
            });
        }

        if (Array.isArray(quote?.unavailableItems) && quote.unavailableItems.length > 0) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Some items are unavailable',
                text2: 'Please update your cart quantities.',
            });
            return;
        }

        if (shouldNavigate) {
            let order = {
                city,
                country,
                dateOrdered: Date.now(),
                orderItems,
                phone,
                shippingAddress1: address,
                shippingAddress2: address2,
                status: 'pending',
                user,
                zip,
                discountCode: quote?.discountCode || discountCode.trim().toUpperCase(),
            }

            navigation.navigate('Payment', { order, quote });
        }
    };

    const checkOut = async () => {
        if (!orderItems || orderItems.length === 0) {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Your cart is empty",
                text2: "Add products before checkout",
            });
            navigation.navigate('Cart Screen', { screen: 'Cart' });
            return;
        }

        if (!address || !city || !zip || !country || !phone) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Missing shipping fields',
                text2: 'Please complete your shipping address first.',
            });
            return;
        }

        const ownerKey = user ? `user:${user}` : 'guest';
        await replaceSavedCartItems(ownerKey, orderItems);

        try {
            await requestQuote(true);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unable to validate checkout';
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Checkout validation failed',
                text2: `${message}`,
            });
        }
    }

    const applyDiscount = async () => {
        if (!discountCode.trim()) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Enter a discount code',
                text2: 'Add a code first before applying.',
            });
            return;
        }

        try {
            await requestQuote(false);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unable to validate discount';
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Discount check failed',
                text2: `${message}`,
            });
        }
    };

    return (

        <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            extraHeight={200}
            enableOnAndroid={true}
        >
            <FormContainer title={"Shipping Address"}>
                <Input
                    placeholder={"Phone"}
                    name={"phone"}
                    value={phone}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setPhone(text)}
                />
                <Input
                    placeholder={"Shipping Address 1"}
                    name={"ShippingAddress1"}
                    value={address}
                    onChangeText={(text) => setAddress(text)}
                />
                <Input
                    placeholder={"Shipping Address 2"}
                    name={"ShippingAddress2"}
                    value={address2}
                    onChangeText={(text) => setAddress2(text)}
                />
                <Input
                    placeholder={"City"}
                    name={"city"}
                    value={city}
                    onChangeText={(text) => setCity(text)}
                />
                <Input
                    placeholder={"Zip Code"}
                    name={"zip"}
                    value={zip}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setZip(text)}
                />
                <Picker
                    style={styles.picker}
                    minWidth="100%"
                    placeholder="Select your Country"
                    selectedValue={country}
                    dropdownIconColor={colors.text}
                    onValueChange={(itemValue, itemIndex) =>
                        setCountry(itemValue)
                    }>

                    {countries.map((c, index) => {
                        return (
                            <Picker.Item
                                key={c.code}
                                label={c.name}
                                value={c.name}
                                color={colors.text}
                            />
                        )
                    })}

                </Picker>

                <Input
                    placeholder={'Discount Code'}
                    name={'discountCode'}
                    value={discountCode}
                    onChangeText={(text) => setDiscountCode((text || '').toUpperCase())}
                />

                {discountPreview ? (
                    <View style={styles.discountPreviewWrap}>
                        <Text style={styles.discountPreviewText}>
                            Discount: PHP {Number(discountPreview.discountAmount || 0).toFixed(2)}
                        </Text>
                        <Text style={styles.discountPreviewSubtext}>
                            Total after discount: PHP {Number(discountPreview.totalPrice || 0).toFixed(2)}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.buttonStack}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={applyDiscount}
                        disabled={quoteLoading}
                    >
                        <Text style={styles.secondaryButtonText}>APPLY DISCOUNT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, quoteLoading && styles.actionButtonDisabled]}
                        onPress={() => checkOut()}
                        disabled={quoteLoading}
                    >
                        {quoteLoading ? (
                            <ActivityIndicator color={colors.surface} size="small" />
                        ) : (
                            <Text style={styles.actionButtonText}>CONFIRM SHIPPING</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => navigation.navigate('Cart Screen', { screen: 'Cart' })}
                        disabled={quoteLoading}
                    >
                        <Text style={styles.secondaryButtonText}>BACK TO CART</Text>
                    </TouchableOpacity>
                </View>
            </FormContainer>
        </KeyboardAwareScrollView>

    )
}

const styles = StyleSheet.create({
    picker: {
        width: '100%',
        backgroundColor: colors.surface,
        color: colors.text,
        marginTop: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
    },
    discountPreviewWrap: {
        width: '100%',
        marginTop: spacing.sm,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSoft,
    },
    discountPreviewText: {
        color: colors.success,
        fontWeight: '800',
    },
    discountPreviewSubtext: {
        color: colors.text,
        marginTop: 4,
        fontWeight: '600',
    },
    buttonStack: {
        width: '100%',
        marginTop: spacing.md,
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

export default Checkout
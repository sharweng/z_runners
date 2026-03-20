import React, { useEffect, useState, useContext } from 'react'
import { Text, View, Button, SafeAreaView, Select, StyleSheet } from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'
import FormContainer from '../../Shared/FormContainer'
import Input from '../../Shared/Input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'

const countries = require("../../data/countries.json");
import AuthGlobal from '../../Context/Store/AuthGlobal'
import Toast from 'react-native-toast-message'
import { colors, spacing } from '../../Shared/theme'
import { replaceSavedCartItems } from '../Cart/cartStorage';
const Checkout = (props) => {
    const [user, setUser] = useState('')
    const [orderItems, setOrderItems] = useState([])
    const [address, setAddress] = useState('')
    const [address2, setAddress2] = useState('')
    const [city, setCity] = useState('')
    const [zip, setZip] = useState('')
    const [country, setCountry] = useState('Philippines')
    const [phone, setPhone] = useState('')

    const navigation = useNavigation()
    const cartItems = useSelector(state => state.cartItems)
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

        return () => {
            setOrderItems();
        }
    }, [])

    const checkOut = async () => {
        console.log("orders", orderItems)
        await replaceSavedCartItems(orderItems);
        let order = {
            city,
            country,
            dateOrdered: Date.now(),
            orderItems,
            phone,
            shippingAddress1: address,
            shippingAddress2: address2,
            status: "pending",
            user,
            zip,
        }
        console.log("ship", order)
        navigation.navigate("Payment", { order })
    }
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
                    onValueChange={(itemValue, itemIndex) =>
                        setCountry(itemValue)
                    }>

                    {countries.map((c, index) => {
                        return (
                            <Picker.Item
                                key={c.code}
                                label={c.name}
                                value={c.code} />
                        )
                    })}

                </Picker>


                <View style={{ width: '80%', alignItems: "center" }}>
                    <Button color={colors.accent} title="Confirm" onPress={() => checkOut()} />
                </View>
            </FormContainer>
        </KeyboardAwareScrollView>

    )
}

const styles = StyleSheet.create({
    picker: {
        width: '100%',
        backgroundColor: colors.surface,
        marginTop: spacing.sm,
    },
});

export default Checkout
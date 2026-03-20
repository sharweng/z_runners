import React, { useCallback } from "react";
import { View, FlatList, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OrderCard from "../../Shared/OrderCard";
import { colors, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../Redux/Actions/orderActions';
const Orders = (props) => {
    const dispatch = useDispatch();
    const { items: orderList } = useSelector((state) => state.orders);

    useFocusEffect(
        useCallback(
            () => {
                getOrders();
                return () => {
                }
            }, [],
        )
    )

    const getOrders = () => {
        AsyncStorage.getItem("jwt")
            .then((token) => {
                return dispatch(fetchOrders(token))
            })
            .catch((error) => console.log(error))
    }

    return (

        <View style={styles.container}>
            <FlatList
                data={orderList}
                renderItem={({ item }) => (
                    <OrderCard item={item} update={true} />
                )
                }
                keyExtractor={(item) => item.id}
            />
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
});

export default Orders;
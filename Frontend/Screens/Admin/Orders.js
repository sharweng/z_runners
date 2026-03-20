import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from 'react-native'
import axios from 'axios'
import baseURL from "../../constants/baseurl";
import { useFocusEffect } from '@react-navigation/native'
import OrderCard from "../../Shared/OrderCard";
import { colors, spacing } from "../../Shared/theme";
const Orders = (props) => {
    const [orderList, setOrderList] = useState()

    useFocusEffect(
        useCallback(
            () => {
                getOrders();
                return () => {
                    setOrderList()
                }
            }, [],
        )
    )

    const getOrders = () => {
        axios.get(`${baseURL}orders`)
            .then((res) => {
                setOrderList(res.data)
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
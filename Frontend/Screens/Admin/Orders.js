import React, { useCallback } from "react";
import { View, FlatList, StyleSheet, Text } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import OrderCard from "../../Shared/OrderCard";
import { colors, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../Redux/Actions/orderActions';
import { getJwtToken } from '../../utils/tokenStorage';
const Orders = (props) => {
    const dispatch = useDispatch();
    const { items: orderList } = useSelector((state) => state.orders);
    const [adminPushMessage, setAdminPushMessage] = React.useState('');

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
        getJwtToken()
            .then((token) => {
                return dispatch(fetchOrders(token))
            })
            .catch((error) => console.log(error))
    }

    React.useEffect(() => {
        if (!Array.isArray(orderList) || orderList.length === 0) {
            return;
        }

        const newestPaid = orderList.find((order) => order?.paymentStatus === 'captured');
        if (newestPaid) {
            setAdminPushMessage(`Push: New funded order #${newestPaid.id} is ready for fulfillment.`);
        }
    }, [orderList]);

    const handleStatusUpdated = (updatedOrder) => {
        const orderId = updatedOrder?.id || 'N/A';
        const status = updatedOrder?.status || 'updated';
        setAdminPushMessage(`Push: Order #${orderId} status changed to ${status}.`);
    };

    return (

        <View style={styles.container}>
            {adminPushMessage ? (
                <View style={styles.notificationBanner}>
                    <Text style={styles.notificationText}>{adminPushMessage}</Text>
                </View>
            ) : null}
            <FlatList
                data={orderList}
                renderItem={({ item }) => (
                    <OrderCard item={item} update={true} onStatusUpdated={handleStatusUpdated} />
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
    notificationBanner: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        padding: spacing.sm,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.surface,
    },
    notificationText: {
        color: colors.primary,
        fontWeight: '700',
    },
});

export default Orders;
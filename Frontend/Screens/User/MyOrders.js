import React, { useCallback, useContext } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';

import OrderCard from '../../Shared/OrderCard';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { fetchMyOrders, updateMyOrderStatus } from '../../Redux/Actions/orderActions';
import { colors, spacing } from '../../Shared/theme';

const MyOrders = () => {
    const dispatch = useDispatch();
    const context = useContext(AuthGlobal);
    const navigation = useNavigation();
    const { items: orders, loading, updating } = useSelector((state) => state.orders);

    const isAuthenticated = !!context?.stateUser?.isAuthenticated;
    const userId = context?.stateUser?.user?.userId;

    const loadOrders = useCallback(async () => {
        if (!userId) {
            return;
        }

        try {
            const token = await AsyncStorage.getItem('jwt');
            if (!token) {
                return;
            }
            await dispatch(fetchMyOrders(userId, token));
        } catch (error) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Failed to load your orders',
            });
        }
    }, [dispatch, userId]);

    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Please login to view your orders',
                });
                navigation.navigate('User', { screen: 'Login' });
                return;
            }

            loadOrders();
        }, [isAuthenticated, loadOrders, navigation])
    );

    const onUpdateStatus = async (order, nextStatus) => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            if (!token) {
                return;
            }

            await dispatch(updateMyOrderStatus(order.id, nextStatus, token));
            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: 'Order updated',
            });
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Please try again';
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Order update failed',
                text2: message,
            });
        }
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.cardWrap}>
                <OrderCard
                    item={item}
                    update={false}
                    compact
                    actionLoading={updating}
                    onCancelOrder={() => onUpdateStatus(item, 'cancelled')}
                    onMarkDelivered={() => onUpdateStatus(item, 'delivered')}
                    onViewDetails={() => navigation.navigate('Order Details', { order: item })}
                />
            </View>
        );
    };

    if (!loading && (!orders || orders.length === 0)) {
        return (
            <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No orders yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    cardWrap: {
        marginBottom: spacing.md,
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    emptyText: {
        color: colors.muted,
        fontWeight: '700',
    },
});

export default MyOrders;

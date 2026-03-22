import React, { useCallback, useContext } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';

import OrderCard from '../../Shared/OrderCard';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { fetchMyOrders, updateMyOrderStatus } from '../../Redux/Actions/orderActions';
import { colors, spacing } from '../../Shared/theme';
import { getJwtToken } from '../../utils/tokenStorage';

const STATUS_FILTERS = ['all', 'pending', 'shipped', 'delivered', 'cancelled'];

const normalizeStatus = (status) => {
    const value = String(status || '').trim().toLowerCase();

    if (value === '3' || value === 'ongoing') {
        return 'pending';
    }

    if (value === '2') {
        return 'shipped';
    }

    if (value === '1') {
        return 'delivered';
    }

    if (value === 'canceled') {
        return 'cancelled';
    }

    return value || 'pending';
};

const MyOrders = () => {
    const dispatch = useDispatch();
    const context = useContext(AuthGlobal);
    const navigation = useNavigation();
    const { items: orders, loading, updating } = useSelector((state) => state.orders);
    const [statusFilter, setStatusFilter] = React.useState('all');

    const isAuthenticated = !!context?.stateUser?.isAuthenticated;
    const userId = context?.stateUser?.user?.userId;

    const filteredOrders = React.useMemo(() => {
        if (!Array.isArray(orders)) {
            return [];
        }

        if (statusFilter === 'all') {
            return orders;
        }

        return orders.filter((order) => normalizeStatus(order?.status) === statusFilter);
    }, [orders, statusFilter]);

    const loadOrders = useCallback(async () => {
        if (!userId) {
            return;
        }

        try {
            const token = await getJwtToken();
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
                    text1: 'Please login before placing orders',
                });
                navigation.navigate('User', { screen: 'Login' });
                return;
            }

            loadOrders();
        }, [isAuthenticated, loadOrders, navigation])
    );

    const onUpdateStatus = async (order, nextStatus) => {
        try {
            const token = await getJwtToken();
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
                    onPressCard={() => navigation.navigate('Order Details', { order: item })}
                    onCancelOrder={() => onUpdateStatus(item, 'cancelled')}
                    onMarkDelivered={() => onUpdateStatus(item, 'delivered')}
                />
            </View>
        );
    };

    const renderStatusFilters = () => (
        <View style={styles.stickyHeader}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {STATUS_FILTERS.map((status) => {
                    const active = statusFilter === status;
                    const label = status.charAt(0).toUpperCase() + status.slice(1);

                    return (
                        <TouchableOpacity
                            key={status}
                            style={[styles.filterChip, active ? styles.filterChipActive : null]}
                            onPress={() => setStatusFilter(status)}
                        >
                            <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredOrders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderStatusFilters}
                stickyHeaderIndices={[0]}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>
                            {loading ? 'Loading orders...' : 'No orders for this status.'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    stickyHeader: {
        backgroundColor: colors.background,
        paddingTop: spacing.sm,
    },
    listContent: {
        paddingBottom: spacing.xl,
        flexGrow: 1,
    },
    filterRow: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        gap: spacing.sm,
    },
    filterChip: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        color: colors.text,
        fontWeight: '700',
    },
    filterChipTextActive: {
        color: '#ffffff',
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

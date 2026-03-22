import React, { useCallback } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import OrderCard from "../../Shared/OrderCard";
import { colors, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../Redux/Actions/orderActions';
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

const Orders = (props) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { items: orderList } = useSelector((state) => state.orders);
    const [statusFilter, setStatusFilter] = React.useState('all');

    const filteredOrders = React.useMemo(() => {
        if (!Array.isArray(orderList)) {
            return [];
        }

        if (statusFilter === 'all') {
            return orderList;
        }

        return orderList.filter((order) => normalizeStatus(order?.status) === statusFilter);
    }, [orderList, statusFilter]);

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
                renderItem={({ item }) => (
                    <OrderCard
                        item={item}
                        update={true}
                        compact
                        onPressCard={() => navigation.navigate('Order Details', { order: item })}
                    />
                )
                }
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderStatusFilters}
                stickyHeaderIndices={[0]}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders for this status.</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingBottom: spacing.lg,
        flexGrow: 1,
    },
    stickyHeader: {
        backgroundColor: colors.background,
        paddingTop: spacing.sm,
    },
    filterRow: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
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
    emptyText: {
        color: colors.muted,
        textAlign: 'center',
        marginTop: spacing.xl,
        fontWeight: '700',
    },
});

export default Orders;
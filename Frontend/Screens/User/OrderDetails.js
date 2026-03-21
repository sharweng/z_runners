import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing } from '../../Shared/theme';

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  return `$${amount.toFixed(2)}`;
};

const formatDate = (rawDate) => {
  if (!rawDate) {
    return 'N/A';
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleString();
};

const getItemTotal = (item) => {
  const quantity = Number(item?.quantity) || 0;
  const unitPrice = Number(item?.product?.price) || 0;
  return quantity * unitPrice;
};

const normalizeStatus = (status) => {
  if (status === '3' || status === 'ongoing') {
    return 'pending';
  }

  if (status === '2') {
    return 'shipped';
  }

  if (status === '1') {
    return 'delivered';
  }

  if (status === 'canceled') {
    return 'cancelled';
  }

  return status || 'pending';
};

const OrderDetails = ({ route }) => {
  const order = route?.params?.order;

  const orderItems = useMemo(() => {
    if (!Array.isArray(order?.orderItems)) {
      return [];
    }

    return order.orderItems;
  }, [order]);

  if (!order) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Order details are unavailable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <Text style={styles.meta}>Status: {normalizeStatus(order.status)}</Text>
        <Text style={styles.meta}>Placed: {formatDate(order.dateOrdered)}</Text>
        <Text style={styles.meta}>Total: {formatMoney(order.totalPrice)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <Text style={styles.meta}>Address 1: {order.shippingAddress1 || 'N/A'}</Text>
        <Text style={styles.meta}>Address 2: {order.shippingAddress2 || 'N/A'}</Text>
        <Text style={styles.meta}>City: {order.city || 'N/A'}</Text>
        <Text style={styles.meta}>Zip: {order.zip || 'N/A'}</Text>
        <Text style={styles.meta}>Country: {order.country || 'N/A'}</Text>
        <Text style={styles.meta}>Phone: {order.phone || 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {orderItems.length === 0 ? <Text style={styles.meta}>No line items available.</Text> : null}
        {orderItems.map((item, index) => (
          <View key={item?.id || `${order.id}-item-${index}`}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item?.product?.name || 'Unknown product'}</Text>
                <Text style={styles.itemMeta}>Qty: {Number(item?.quantity) || 0}</Text>
                <Text style={styles.itemMeta}>Unit: {formatMoney(item?.product?.price)}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatMoney(getItemTotal(item))}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  itemMeta: {
    color: colors.muted,
  },
  itemTotal: {
    color: colors.primary,
    fontWeight: '800',
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

export default OrderDetails;

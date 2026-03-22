import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import { colors, spacing } from '../../Shared/theme';
import { fetchProductsByIds } from '../../Redux/Actions/productActions';
import { fetchOrderById } from '../../Redux/Actions/orderActions';
import { getJwtToken } from '../../utils/tokenStorage';

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  return `PHP ${amount.toFixed(2)}`;
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

const getProductId = (item) => {
  const source = item?.product ?? item?.productId;

  if (!source) {
    return null;
  }

  if (typeof source === 'string') {
    return source;
  }

  if (typeof source === 'object' && typeof source?.$oid === 'string') {
    return source.$oid;
  }

  const nested = source.id || source._id || null;
  if (!nested) {
    return null;
  }

  if (typeof nested === 'string') {
    return nested;
  }

  if (typeof nested === 'object' && typeof nested?.$oid === 'string') {
    return nested.$oid;
  }

  return String(nested);
};

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

const toTitleCase = (value) => {
  const normalized = normalizeStatus(value);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const buildOrderReference = (orderId) => {
  const source = String(orderId || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!source) {
    return 'N/A';
  }

  return `ZR-${source.slice(-8)}`;
};

const renderKeyValueRow = (label, value, strong = false) => (
  <View style={styles.kvRow}>
    <Text style={[styles.kvLabel, strong && styles.kvStrong]}>{label}</Text>
    <Text style={[styles.kvValue, strong && styles.kvStrong]} numberOfLines={2} ellipsizeMode="tail">{value}</Text>
  </View>
);

const OrderDetails = ({ route }) => {
  const order = route?.params?.order;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { byId: byIdProducts, byIdLoading, byIdError } = useSelector((state) => state.products);
  const { selected: selectedOrder, selectedLoading, selectedError } = useSelector((state) => state.orders);

  const [resolvedProducts, setResolvedProducts] = useState({});
  const [resolvedOrder, setResolvedOrder] = useState(order);

  const displayOrder = resolvedOrder || order;
  const orderReference = buildOrderReference(displayOrder?.id);
  const orderItems = useMemo(() => {
    if (!Array.isArray(displayOrder?.orderItems)) {
      return [];
    }

    return displayOrder.orderItems;
  }, [displayOrder]);

  useEffect(() => {
    setResolvedOrder(order);
  }, [order]);

  useEffect(() => {
    if (selectedOrder?.id === order?.id) {
      setResolvedOrder(selectedOrder);
    }
  }, [selectedOrder, order?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadFreshOrder = async () => {
      if (!order?.id) {
        return;
      }

      try {
        const token = await getJwtToken();
        if (!token) {
          return;
        }

        const data = await dispatch(fetchOrderById(order.id, token));

        if (!isMounted) {
          return;
        }

        if (data) {
          setResolvedOrder(data);
        }
      } catch (error) {
        // Keep fallback order payload from route.
      }
    };

    loadFreshOrder();

    return () => {
      isMounted = false;
    };
  }, [order?.id]);

  useEffect(() => {
    let isMounted = true;

    const hydrateProducts = async () => {
      const productIds = orderItems
        .map((item) => getProductId(item))
        .filter((productId, index, list) => productId && list.indexOf(productId) === index);

      if (!productIds.length) {
        return;
      }

      try {
        const productMap = await dispatch(fetchProductsByIds(productIds));

        if (!isMounted) {
          return;
        }

        setResolvedProducts((prev) => ({ ...prev, ...productMap }));
      } catch (error) {
        // Some products may be unavailable.
      }
    };

    hydrateProducts();

    return () => {
      isMounted = false;
    };
  }, [dispatch, orderItems]);

  useEffect(() => {
    if (!byIdProducts || Object.keys(byIdProducts).length === 0) {
      return;
    }

    setResolvedProducts((prev) => ({ ...prev, ...byIdProducts }));
  }, [byIdProducts]);

  const openProductDetails = (productId, product = {}) => {
    const normalizedProductId = getProductId({ product: productId || product });
    if (!normalizedProductId) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Product unavailable',
        text2: 'Unable to open this product.',
      });
      return;
    }

    navigation.navigate('Product Detail', {
      item: {
        ...product,
        id: normalizedProductId,
        _id: normalizedProductId,
      },
    });
  };

  const getProductSnapshot = (item) => {
    const productId = getProductId(item);
    const hydrated = productId ? resolvedProducts[productId] : null;
    return item?.product && typeof item.product === 'object' ? item.product : hydrated;
  };

  if (!displayOrder) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Order details are unavailable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.receiptMetaBlock}>
          <View style={styles.receiptMetaRow}>
            <Text style={styles.receiptMetaLabel}>Ref No.</Text>
            <Text style={styles.receiptMetaValue}>{orderReference}</Text>
          </View>
          <View style={styles.receiptMetaRow}>
            <Text style={styles.receiptMetaLabel}>Date</Text>
            <Text style={styles.receiptMetaValue}>{formatDate(displayOrder.dateOrdered)}</Text>
          </View>
        </View>

        <Text style={styles.title}>Order #{displayOrder.id}</Text>
        <Text style={styles.meta}>Status: {toTitleCase(displayOrder.status)}</Text>
        <Text style={styles.meta}>Payment: {displayOrder.paymentMethod || 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        {renderKeyValueRow('Address', displayOrder.shippingAddress1 || 'N/A')}
        {renderKeyValueRow('Address 2', displayOrder.shippingAddress2 || 'N/A')}
        {renderKeyValueRow('City', displayOrder.city || 'N/A')}
        {renderKeyValueRow('Zip', displayOrder.zip || 'N/A')}
        {renderKeyValueRow('Country', displayOrder.country || 'N/A')}
        {renderKeyValueRow('Phone', displayOrder.phone || 'N/A')}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {selectedLoading ? <Text style={styles.meta}>Loading latest order details...</Text> : null}
        {selectedError ? <Text style={styles.errorText}>Unable to refresh the latest order snapshot.</Text> : null}
        {byIdLoading ? <Text style={styles.meta}>Loading product details...</Text> : null}
        {byIdError ? <Text style={styles.errorText}>Some product details could not be loaded.</Text> : null}
        {orderItems.length === 0 ? <Text style={styles.meta}>No line items available.</Text> : null}

        {orderItems.map((item, index) => {
          const productId = getProductId(item);
          const productData = getProductSnapshot(item);
          const productName = productData?.name || item?.name || 'Product unavailable';
          const productBrand = productData?.brand || item?.brand || 'N/A';
          const productImage = productData?.image || item?.image || 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
          const quantity = Number(item?.quantity) || 0;
          const unitPrice = Number(item?.product?.price ?? productData?.price ?? item?.unitPrice) || 0;
          const lineTotal = unitPrice * quantity;

          return (
            <View key={item?.id || `${displayOrder.id}-item-${index}`}>
              {index > 0 ? <View style={styles.separator} /> : null}
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.itemRow}
                onPress={() => openProductDetails(productId, productData || {})}
              >
                <Image source={{ uri: productImage }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{productName}</Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>{productBrand}</Text>
                  <Text style={styles.itemMeta}>Qty: {quantity}</Text>
                  <Text style={styles.itemMeta}>Unit: {formatMoney(unitPrice)}</Text>
                </View>
                <Text style={styles.itemTotal}>{formatMoney(lineTotal)}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Receipt Summary</Text>
        {renderKeyValueRow('Subtotal', formatMoney(displayOrder.subtotal || 0))}
        {renderKeyValueRow('Discount', `-${formatMoney(displayOrder.discountAmount || 0)}`)}
        {renderKeyValueRow('Shipping', formatMoney(displayOrder.shippingFee || 0))}
        {renderKeyValueRow('Total', formatMoney(displayOrder.totalPrice || 0), true)}
        {renderKeyValueRow('Payment Method', displayOrder.paymentMethod || 'N/A')}
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
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
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
  receiptMetaBlock: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptMetaLabel: {
    color: colors.muted,
    fontWeight: '700',
  },
  receiptMetaValue: {
    color: colors.text,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kvLabel: {
    width: 116,
    color: colors.muted,
    fontWeight: '700',
  },
  kvValue: {
    flex: 1,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  kvStrong: {
    color: colors.primary,
    fontWeight: '800',
  },
  separator: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  itemTotal: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
    minWidth: 88,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.xs,
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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import axios from 'axios';

import { colors, spacing } from '../../Shared/theme';
import { fetchProductsByIds } from '../../Redux/Actions/productActions';
import { getJwtToken } from '../../utils/tokenStorage';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import baseURL from '../../constants/baseurl';

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

const OrderDetails = ({ route }) => {
  const order = route?.params?.order;
  const authContext = useContext(AuthGlobal);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { byId: byIdProducts, byIdLoading, byIdError } = useSelector((state) => state.products);

  const [resolvedProducts, setResolvedProducts] = useState({});
  const [resolvedOrder, setResolvedOrder] = useState(order);

  const displayOrder = resolvedOrder || order;
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

        const response = await axios.get(`${baseURL}orders/my-order/${order.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) {
          return;
        }

        if (response?.data) {
          setResolvedOrder(response.data);
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
        <Text style={styles.title}>Order #{displayOrder.id}</Text>
        <Text style={styles.meta}>Status: {toTitleCase(displayOrder.status)}</Text>
        <Text style={styles.meta}>Placed: {formatDate(displayOrder.dateOrdered)}</Text>
        <Text style={styles.meta}>Total: {formatMoney(displayOrder.totalPrice)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <Text style={styles.meta}>Address 1: {displayOrder.shippingAddress1 || 'N/A'}</Text>
        <Text style={styles.meta}>Address 2: {displayOrder.shippingAddress2 || 'N/A'}</Text>
        <Text style={styles.meta}>City: {displayOrder.city || 'N/A'}</Text>
        <Text style={styles.meta}>Zip: {displayOrder.zip || 'N/A'}</Text>
        <Text style={styles.meta}>Country: {displayOrder.country || 'N/A'}</Text>
        <Text style={styles.meta}>Phone: {displayOrder.phone || 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
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

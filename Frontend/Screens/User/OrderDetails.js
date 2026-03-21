import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

import { colors, radius, shadow, spacing } from '../../Shared/theme';
import { fetchProductsByIds } from '../../Redux/Actions/productActions';
import { submitReview } from '../../Redux/Actions/reviewActions';
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

const getItemTotal = (item, resolvedProducts) => {
  const quantity = Number(item?.quantity) || 0;
  const productId = getProductId(item);
  const hydratedPrice = productId ? resolvedProducts?.[productId]?.price : undefined;
  const unitPrice = Number(item?.product?.price ?? hydratedPrice) || 0;
  return quantity * unitPrice;
};

const getProductId = (item) => {
  const source = item?.product || item?.id || item?._id;

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

const formatReviewDate = (rawDate) => {
  if (!rawDate) {
    return 'N/A';
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleDateString();
};

const buildStars = (rating) => {
  const score = Math.min(5, Math.max(1, Number(rating) || 0));
  const filled = '★'.repeat(Math.round(score));
  const empty = '☆'.repeat(5 - Math.round(score));
  return `${filled}${empty}`;
};

const getAverageRating = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + (Number(review?.rating) || 0), 0);
  return total / reviews.length;
};

const OrderDetails = ({ route }) => {
  const order = route?.params?.order;
  const authContext = useContext(AuthGlobal);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    byId: byIdProducts,
    byIdLoading,
    byIdError,
  } = useSelector((state) => state.products);
  const [resolvedProducts, setResolvedProducts] = useState({});
  const [resolvedOrder, setResolvedOrder] = useState(order);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittingReviews, setSubmittingReviews] = useState({});

  const currentUserId = authContext?.stateUser?.user?.userId || null;
  const displayOrder = resolvedOrder || order;
  const isDeliveredOrder = normalizeStatus(displayOrder?.status) === 'delivered';

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
        // Keep route order data as a fallback when refetch fails.
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
      const productIdsToLoad = orderItems
        .map((item) => getProductId(item))
        .filter((productId, index, list) => {
          if (!productId || list.indexOf(productId) !== index) {
            return false;
          }

          const product = orderItems.find((orderItem) => getProductId(orderItem) === productId)?.product;
          return !(product && typeof product === 'object' && product.name);
        });

      if (!productIdsToLoad.length) {
        return;
      }

      try {
        const productMap = await dispatch(fetchProductsByIds(productIdsToLoad));

        if (!isMounted) {
          return;
        }

        setResolvedProducts((prev) => ({ ...prev, ...productMap }));
      } catch (error) {
        // Product might be removed from catalog; keep graceful fallback UI.
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
        text2: 'Unable to open product details for this item.',
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
    const hydratedProduct = productId ? resolvedProducts[productId] : null;
    return item?.product && typeof item.product === 'object' ? item.product : hydratedProduct;
  };

  const getDraft = (productId) => {
    const existing = reviewDrafts[productId];
    if (existing) {
      return existing;
    }

    return {
      rating: 5,
      comment: '',
    };
  };

  const updateDraft = (productId, patch) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...getDraft(productId),
        ...patch,
      },
    }));
  };

  const submitProductReview = async (productId, existingReviewId = null) => {
    const draft = getDraft(productId);
    const token = await getJwtToken();

    if (!token) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Login required',
        text2: 'Please login to submit a review.',
      });
      return;
    }

    if (!draft.comment || !String(draft.comment).trim()) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Comment required',
        text2: 'Please write a short review comment.',
      });
      return;
    }

    setSubmittingReviews((prev) => ({ ...prev, [productId]: true }));

    try {
      await dispatch(
        submitReview(
          productId,
          {
            rating: Number(draft.rating) || 5,
            comment: String(draft.comment).trim(),
          },
          token,
          existingReviewId
        )
      );

      await dispatch(fetchProductsByIds([productId]));
      Toast.show({
        topOffset: 60,
        type: 'success',
        text1: existingReviewId ? 'Review updated' : 'Review submitted',
      });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Unable to submit review';
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Review failed',
        text2: `${message}`,
      });
    } finally {
      setSubmittingReviews((prev) => ({ ...prev, [productId]: false }));
    }
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
        <Text style={styles.meta}>Status: {normalizeStatus(displayOrder.status)}</Text>
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
        {isDeliveredOrder ? (
          <Text style={styles.meta}>You can rate and review purchased items below.</Text>
        ) : (
          <Text style={styles.meta}>Review and rating are enabled after this order is delivered.</Text>
        )}
        {byIdLoading ? <Text style={styles.meta}>Loading product details...</Text> : null}
        {byIdError ? <Text style={styles.errorText}>Some product details could not be loaded.</Text> : null}
        {orderItems.length === 0 ? <Text style={styles.meta}>No line items available.</Text> : null}
        {orderItems.map((item, index) => (
          <View key={item?.id || `${displayOrder.id}-item-${index}`}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                {(() => {
                  const productId = getProductId(item);
                  const productData = getProductSnapshot(item);
                  const productName = productData?.name || 'Product unavailable';

                  if (productId) {
                    return (
                      <TouchableOpacity onPress={() => openProductDetails(productId, productData || {})} activeOpacity={0.7}>
                        <Text style={[styles.itemName, styles.linkText]}>{productName}</Text>
                      </TouchableOpacity>
                    );
                  }

                  return <Text style={styles.itemName}>{productName}</Text>;
                })()}
                <Text style={styles.itemMeta}>Qty: {Number(item?.quantity) || 0}</Text>
                <Text style={styles.itemMeta}>Unit: {formatMoney(item?.product?.price || resolvedProducts[getProductId(item)]?.price)}</Text>

                {(() => {
                  const productId = getProductId(item);
                  if (!productId) {
                    return null;
                  }

                  const productData = getProductSnapshot(item);
                  const reviews = Array.isArray(productData?.reviews) ? productData.reviews : [];
                  const existingReview = currentUserId
                    ? reviews.find((review) => String(review?.user) === String(currentUserId))
                    : null;
                  const draft = getDraft(productId);
                  const isSubmitting = !!submittingReviews[productId];

                  return (
                    <View style={styles.reviewWrap}>
                      <Text style={styles.reviewTitle}>Ratings & Reviews ({reviews.length})</Text>
                      {reviews.length > 0 ? (
                        <Text style={styles.reviewSummary}>
                          {buildStars(getAverageRating(reviews))} {getAverageRating(reviews).toFixed(1)}/5
                        </Text>
                      ) : null}
                      {reviews.length === 0 ? <Text style={styles.reviewEmpty}>No reviews yet.</Text> : null}
                      {reviews.map((review) => (
                        <View key={review?._id || `${productId}-${review?.user}-${review?.dateCreated}`} style={styles.reviewItem}>
                          <Text style={styles.reviewHeader}>{review?.name || 'User'} - {buildStars(review?.rating)} ({Number(review?.rating) || 0}/5)</Text>
                          <Text style={styles.reviewComment}>{review?.comment || ''}</Text>
                          <Text style={styles.reviewDate}>{formatReviewDate(review?.dateUpdated || review?.dateCreated)}</Text>
                        </View>
                      ))}

                      {isDeliveredOrder ? (
                        <View style={styles.reviewForm}>
                          <Text style={styles.reviewFormTitle}>{existingReview ? 'Update Your Review' : 'Add Your Review'}</Text>
                          <Picker
                            style={styles.reviewPicker}
                            selectedValue={draft.rating}
                            onValueChange={(value) => updateDraft(productId, { rating: Number(value) })}
                          >
                            <Picker.Item label="5 - Excellent" value={5} />
                            <Picker.Item label="4 - Good" value={4} />
                            <Picker.Item label="3 - Average" value={3} />
                            <Picker.Item label="2 - Fair" value={2} />
                            <Picker.Item label="1 - Poor" value={1} />
                          </Picker>
                          <TextInput
                            style={styles.reviewInput}
                            placeholder="Write your review"
                            placeholderTextColor={colors.muted}
                            value={draft.comment}
                            multiline
                            onChangeText={(text) => updateDraft(productId, { comment: text })}
                          />
                          <TouchableOpacity
                            style={[styles.reviewButton, isSubmitting ? styles.reviewButtonDisabled : null]}
                            disabled={isSubmitting}
                            onPress={() => submitProductReview(productId, existingReview?._id || null)}
                          >
                            <Text style={styles.reviewButtonText}>{isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  );
                })()}
              </View>
              <Text style={styles.itemTotal}>{formatMoney(getItemTotal(item, resolvedProducts))}</Text>
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
  linkText: {
    textDecorationLine: 'underline',
  },
  itemMeta: {
    color: colors.muted,
  },
  itemTotal: {
    color: colors.primary,
    fontWeight: '800',
  },
  reviewWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reviewTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  reviewSummary: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  reviewEmpty: {
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  reviewItem: {
    paddingVertical: spacing.xs,
  },
  reviewHeader: {
    color: colors.text,
    fontWeight: '700',
  },
  reviewComment: {
    color: colors.text,
  },
  reviewDate: {
    color: colors.muted,
    fontSize: 12,
  },
  reviewForm: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  reviewFormTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  reviewPicker: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  reviewInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  reviewButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  reviewButtonDisabled: {
    opacity: 0.7,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: '700',
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

import React, { useState, useEffect, useContext } from "react";
import { Image, View, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { Surface, } from "react-native-paper";
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { colors, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../../Redux/Actions/productActions';
import { fetchMyOrders } from '../../Redux/Actions/orderActions';
import { deleteReview as deleteReviewAction, resetReviewSubmit, submitReview as submitReviewAction } from '../../Redux/Actions/reviewActions';
import { getJwtToken } from '../../utils/tokenStorage';

const { width } = Dimensions.get('window');

const toIdString = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object' && typeof value?.$oid === 'string') {
        return value.$oid;
    }

    return String(value);
};

const SingleProduct = ({ route }) => {
    const routeProductId = toIdString(route?.params?.item?.id || route?.params?.item?._id);
    const [item, setItem] = useState({
        ...(route?.params?.item || {}),
        id: routeProductId,
        _id: routeProductId,
    });
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [canReview, setCanReview] = useState(false);
    const context = useContext(AuthGlobal);
    const dispatch = useDispatch();
    const { selected } = useSelector((state) => state.products);

    const currentUserId = context?.stateUser?.user?.userId;
    const reviews = Array.isArray(item?.reviews) ? item.reviews : [];
    const userReview = reviews.find((review) => String(review?.user) === String(currentUserId));
    const showUpdateForm = !!editingReviewId;
    const canWriteNewReview = canReview && !userReview;

    const loadProduct = () => {
        if (!routeProductId) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Product unavailable',
            });
            return;
        }

        dispatch(fetchProductDetails(routeProductId))
            .then((data) => setItem(data))
            .catch(() => {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Unable to load product details',
                });
            });
    };

    useEffect(() => {
        loadProduct();
    }, [routeProductId]);

    useEffect(() => {
        if (selected?.id === routeProductId) {
            setItem(selected);
        }
    }, [selected, routeProductId]);

    useEffect(() => {
        let isMounted = true;

        const checkEligibility = async () => {
            if (!currentUserId || !routeProductId) {
                if (isMounted) {
                    setCanReview(false);
                }
                return;
            }

            try {
                const token = await getJwtToken();
                if (!token) {
                    if (isMounted) {
                        setCanReview(false);
                    }
                    return;
                }

                const data = await dispatch(fetchMyOrders(currentUserId, token));

                const hasDeliveredOrder = Array.isArray(data) && data.some((order) => {
                    const normalizedStatus = String(order?.status || '').toLowerCase();
                    if (normalizedStatus !== 'delivered' && normalizedStatus !== '1') {
                        return false;
                    }

                    return Array.isArray(order?.orderItems) && order.orderItems.some((orderItem) => {
                        const productSource = orderItem?.product;
                        if (typeof productSource === 'string') {
                            return productSource === routeProductId;
                        }

                        return toIdString(productSource?.id || productSource?._id) === routeProductId;
                    });
                });

                if (isMounted) {
                    setCanReview(hasDeliveredOrder);
                }
            } catch (error) {
                if (isMounted) {
                    setCanReview(false);
                }
            }
        };

        checkEligibility();

        return () => {
            isMounted = false;
        };
    }, [currentUserId, routeProductId]);

    const productImages = [item?.image, ...(Array.isArray(item?.images) ? item.images : [])]
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index);

    const onGalleryScroll = (event) => {
        const xOffset = event?.nativeEvent?.contentOffset?.x || 0;
        const nextIndex = Math.round(xOffset / width);
        setActiveImageIndex(nextIndex);
    };

    const submitReview = () => {
        if (!canReview) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Review unavailable',
                text2: 'You can review only after this product is delivered to you.',
            });
            return;
        }

        const parsedRating = Number(rating);

        if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Rating must be from 1 to 5',
            });
            return;
        }

        if (!comment.trim()) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Comment is required',
            });
            return;
        }

        getJwtToken()
            .then((token) => {
                if (!token) {
                    throw new Error('Not authenticated');
                }

                const payload = {
                    rating: parsedRating,
                    comment: comment.trim(),
                };

                return dispatch(submitReviewAction(item.id, payload, token, editingReviewId));
            })
            .then(() => {
                Toast.show({
                    topOffset: 60,
                    type: 'success',
                    text1: editingReviewId ? 'Review updated' : 'Review added',
                });
                setComment('');
                setRating('5');
                setEditingReviewId(null);
                dispatch(resetReviewSubmit());
                loadProduct();
            })
            .catch((error) => {
                const message = error?.response?.data || error?.message || 'Something went wrong';
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Unable to save review',
                    text2: `${message}`,
                });
            });
    };

    const editReview = (review) => {
        setEditingReviewId(review._id);
        setRating(`${review.rating}`);
        setComment(review.comment || '');
    };

    const deleteReview = (reviewId) => {
        if (!reviewId) {
            return;
        }

        getJwtToken()
            .then((token) => {
                if (!token) {
                    throw new Error('Not authenticated');
                }

                return dispatch(deleteReviewAction(item.id, reviewId, token));
            })
            .then(() => {
                Toast.show({
                    topOffset: 60,
                    type: 'success',
                    text1: 'Review deleted',
                });
                setEditingReviewId(null);
                setComment('');
                setRating('5');
                dispatch(resetReviewSubmit());
                loadProduct();
            })
            .catch((error) => {
                const message = error?.response?.data || error?.message || 'Something went wrong';
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Unable to delete review',
                    text2: `${message}`,
                });
            });
    };


    return (
        <Surface style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroWrap}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={onGalleryScroll}
                    >
                        {(productImages.length ? productImages : ['https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'])
                            .map((imageUri) => (
                                <Image
                                    key={imageUri}
                                    source={{ uri: imageUri }}
                                    resizeMode="contain"
                                    style={styles.image}
                                />
                            ))}
                    </ScrollView>

                    {productImages.length > 1 ? (
                        <View style={styles.dotsRow}>
                            {productImages.map((imageUri, index) => (
                                <View
                                    key={`${imageUri}-${index}`}
                                    style={[
                                        styles.dot,
                                        activeImageIndex === index ? styles.dotActive : null,
                                    ]}
                                />
                            ))}
                        </View>
                    ) : null}

                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.contentHeader} size='xl'>{item.name}</Text>
                    <Text style={styles.contentText}>{item.brand}</Text>
                </View>
                <View style={styles.detailCard}>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
                <View style={styles.detailCard}>
                    <Text style={styles.reviewTitle}>Reviews</Text>
                    <Text style={styles.reviewMeta}>Average: {Number(item.rating || 0).toFixed(1)} ({item.numReviews || 0})</Text>

                    {reviews.map((review) => (
                        <View key={review._id} style={styles.reviewItem}>
                            <Text style={styles.reviewAuthor}>{review.name}</Text>
                            <Text style={styles.reviewMeta}>Rating: {review.rating}/5</Text>
                            <Text style={styles.description}>{review.comment}</Text>
                            {canReview && currentUserId && String(review.user) === String(currentUserId) && (
                                <View style={styles.reviewActionsRow}>
                                    <TouchableOpacity style={[styles.inlineHalfButton, styles.editButton]} onPress={() => editReview(review)}>
                                        <Text style={styles.inlineButtonText}>Edit Review</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.inlineHalfButton, styles.deleteButton]} onPress={() => deleteReview(review._id)}>
                                        <Text style={styles.inlineButtonText}>Delete Review</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}

                    {showUpdateForm ? (
                        <>
                            <Text style={styles.reviewTitle}>Update Your Review</Text>
                            <View style={styles.pickerWrap}>
                                <Picker
                                    selectedValue={rating}
                                    onValueChange={(value) => setRating(String(value))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="1" value="1" />
                                    <Picker.Item label="2" value="2" />
                                    <Picker.Item label="3" value="3" />
                                    <Picker.Item label="4" value="4" />
                                    <Picker.Item label="5" value="5" />
                                </Picker>
                            </View>
                            <TextInput
                                value={comment}
                                onChangeText={setComment}
                                placeholder="Write your review"
                                placeholderTextColor={colors.muted}
                                multiline
                                style={[styles.input, styles.textArea]}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={submitReview}>
                                <Text style={styles.primaryButtonText}>Update Review</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={() => {
                                setEditingReviewId(null);
                                setComment('');
                                setRating('5');
                            }}>
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : canWriteNewReview ? (
                        <>
                            <Text style={styles.reviewTitle}>Write a Review</Text>
                            <View style={styles.pickerWrap}>
                                <Picker
                                    selectedValue={rating}
                                    onValueChange={(value) => setRating(String(value))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="1" value="1" />
                                    <Picker.Item label="2" value="2" />
                                    <Picker.Item label="3" value="3" />
                                    <Picker.Item label="4" value="4" />
                                    <Picker.Item label="5" value="5" />
                                </Picker>
                            </View>
                            <TextInput
                                value={comment}
                                onChangeText={setComment}
                                placeholder="Write your review"
                                placeholderTextColor={colors.muted}
                                multiline
                                style={[styles.input, styles.textArea]}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={submitReview}>
                                <Text style={styles.primaryButtonText}>Submit Review</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        !userReview ? (
                            <Text style={styles.reviewEligibilityText}>
                                Write a Review becomes available after you have a delivered order for this product.
                            </Text>
                        ) : null
                    )}
                </View>
            </ScrollView>
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 40,
        backgroundColor: colors.background,
    },
    heroWrap: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    image: {
        width,
        height: 280,
    },
    dotsRow: {
        position: 'absolute',
        bottom: spacing.sm,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    dot: {
        width: 10,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: colors.border,
    },
    dotActive: {
        backgroundColor: colors.primary,
    },
    contentContainer: {
        marginTop: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentHeader: {
        fontWeight: 'bold',
        fontSize: 24,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    contentText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.muted,
        marginBottom: spacing.md
    },
    detailCard: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    description: {
        color: colors.text,
        lineHeight: 22,
    },
    reviewTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    reviewMeta: {
        color: colors.muted,
        marginBottom: spacing.sm,
    },
    reviewEligibilityText: {
        color: colors.muted,
        marginTop: spacing.sm,
        lineHeight: 20,
    },
    reviewItem: {
        borderWidth: 2,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.surfaceSoft,
    },
    reviewAuthor: {
        color: colors.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    pickerWrap: {
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
    },
    picker: {
        color: colors.text,
    },
    textArea: {
        minHeight: 90,
        textAlignVertical: 'top',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.primary,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: '700',
    },
    reviewActionsRow: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        gap: spacing.sm,
    },
    inlineHalfButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.primary,
        paddingVertical: spacing.xs,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    deleteButton: {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
    },
    inlineButtonText: {
        color: 'white',
        fontWeight: '700',
    },
    secondaryButton: {
        marginTop: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.text,
        fontWeight: '700',
    },
})

export default SingleProduct
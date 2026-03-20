import React, { useState, useEffect, useContext } from "react";
import { Image, View, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Surface, } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { colors, radius, shadow, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../../Redux/Actions/productActions';
import { resetReviewSubmit, submitReview as submitReviewAction } from '../../Redux/Actions/reviewActions';

const SingleProduct = ({ route }) => {
    const [item, setItem] = useState(route.params.item);
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const context = useContext(AuthGlobal);
    const dispatch = useDispatch();
    const { selected } = useSelector((state) => state.products);

    const currentUserId = context?.stateUser?.user?.userId;

    const loadProduct = () => {
        dispatch(fetchProductDetails(route.params.item.id))
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
    }, [route.params.item.id]);

    useEffect(() => {
        if (selected?.id === route.params.item.id) {
            setItem(selected);
        }
    }, [selected, route.params.item.id]);

    const submitReview = () => {
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

        AsyncStorage.getItem('jwt')
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


    return (
        <Surface style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroWrap}>
                    <Image
                        source={{
                            uri: item.image ? item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }}
                        resizeMode="contain"
                        style={styles.image}
                    />

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

                    {item.reviews?.map((review) => (
                        <View key={review._id} style={styles.reviewItem}>
                            <Text style={styles.reviewAuthor}>{review.name}</Text>
                            <Text style={styles.reviewMeta}>Rating: {review.rating}/5</Text>
                            <Text style={styles.description}>{review.comment}</Text>
                            {currentUserId && review.user === currentUserId && (
                                <TouchableOpacity style={styles.inlineButton} onPress={() => editReview(review)}>
                                    <Text style={styles.inlineButtonText}>Edit My Review</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <Text style={styles.reviewTitle}>{editingReviewId ? 'Update Your Review' : 'Write a Review'}</Text>
                    <TextInput
                        value={rating}
                        onChangeText={setRating}
                        keyboardType="numeric"
                        placeholder="Rating (1 to 5)"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                    />
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Write your review"
                        placeholderTextColor={colors.muted}
                        multiline
                        style={[styles.input, styles.textArea]}
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={submitReview}>
                        <Text style={styles.primaryButtonText}>{editingReviewId ? 'Update Review' : 'Submit Review'}</Text>
                    </TouchableOpacity>
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
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 280,
    },
    contentContainer: {
        marginTop: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentHeader: {
        fontWeight: 'bold',
        fontSize: 24,
        color: colors.text,
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
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        ...shadow,
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
    reviewItem: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
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
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    textArea: {
        minHeight: 90,
        textAlignVertical: 'top',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: '700',
    },
    inlineButton: {
        marginTop: spacing.sm,
        alignSelf: 'flex-start',
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    inlineButtonText: {
        color: 'white',
        fontWeight: '700',
    },
})

export default SingleProduct
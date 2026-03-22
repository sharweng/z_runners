import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-toast-message';

import Input from '../../Shared/Input';
import baseURL from '../../constants/baseurl';
import { getJwtToken } from '../../utils/tokenStorage';
import { colors, spacing } from '../../Shared/theme';

const initialForm = {
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
};

const toDateInput = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toISOString().slice(0, 10);
};

const mapItemToForm = (item) => ({
    code: String(item?.code || ''),
    description: String(item?.description || ''),
    type: String(item?.type || 'percentage'),
    value: item?.value !== undefined && item?.value !== null ? String(item.value) : '',
    minOrderAmount: item?.minOrderAmount !== undefined && item?.minOrderAmount !== null ? String(item.minOrderAmount) : '0',
    maxDiscountAmount: item?.maxDiscountAmount !== undefined && item?.maxDiscountAmount !== null ? String(item.maxDiscountAmount) : '',
    usageLimit: item?.usageLimit !== undefined && item?.usageLimit !== null ? String(item.usageLimit) : '',
    expiresAt: toDateInput(item?.expiresAt),
    isActive: !!item?.isActive,
});

const Discounts = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingItemId, setEditingItemId] = useState('');
    const [form, setForm] = useState(initialForm);

    const isEditing = !!editingItemId;

    const getAuthHeaders = async () => {
        const token = await getJwtToken();
        return { Authorization: `Bearer ${token}` };
    };

    const fetchDiscounts = useCallback(async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${baseURL}discounts`, { headers });
            setItems(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unable to load discounts';
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Failed to load discounts',
                text2: `${message}`,
            });
        }
    }, []);

    const loadInitial = useCallback(async () => {
        setLoading(true);
        await fetchDiscounts();
        setLoading(false);
    }, [fetchDiscounts]);

    React.useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    const resetForm = () => {
        setForm(initialForm);
        setEditingItemId('');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDiscounts();
        setRefreshing(false);
    };

    const openCreateForm = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const openEditForm = (item) => {
        setEditingItemId(String(item?.id || ''));
        setForm(mapItemToForm(item));
        setIsFormVisible(true);
    };

    const closeForm = () => {
        setIsFormVisible(false);
        resetForm();
    };

    const onChangeField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const submitForm = async () => {
        if (submitting) {
            return;
        }

        if (!form.code.trim() || !String(form.value).trim()) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Missing fields',
                text2: 'Code and value are required',
            });
            return;
        }

        setSubmitting(true);
        try {
            const headers = await getAuthHeaders();
            const payload = {
                code: form.code.trim().toUpperCase(),
                description: form.description.trim(),
                type: form.type,
                value: Number(form.value),
                minOrderAmount: Number(form.minOrderAmount || 0),
                maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
                usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
                expiresAt: form.expiresAt.trim() ? new Date(`${form.expiresAt.trim()}T23:59:59.999Z`).toISOString() : null,
                isActive: !!form.isActive,
            };

            if (isEditing) {
                const response = await axios.put(`${baseURL}discounts/${editingItemId}`, payload, { headers });
                const updated = response.data;
                setItems((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
                Toast.show({
                    topOffset: 60,
                    type: 'success',
                    text1: 'Discount updated',
                    text2: `${updated.code} has been updated.`,
                });
            } else {
                const response = await axios.post(`${baseURL}discounts`, payload, { headers });
                setItems((prev) => [response.data, ...prev]);
                Toast.show({
                    topOffset: 60,
                    type: 'success',
                    text1: 'Discount created',
                    text2: 'Discount code is now available in checkout.',
                });
            }

            closeForm();
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unable to save discount';
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: isEditing ? 'Update failed' : 'Create failed',
                text2: `${message}`,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteDiscount = (item) => {
        Alert.alert(
            'Delete discount',
            `Delete ${item.code}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const headers = await getAuthHeaders();
                            await axios.delete(`${baseURL}discounts/${item.id}`, { headers });
                            setItems((prev) => prev.filter((row) => row.id !== item.id));
                            Toast.show({
                                topOffset: 60,
                                type: 'success',
                                text1: 'Discount deleted',
                                text2: `${item.code} was removed.`,
                            });
                        } catch (error) {
                            const message = error?.response?.data?.message || error?.message || 'Unable to delete discount';
                            Toast.show({
                                topOffset: 60,
                                type: 'error',
                                text1: 'Delete failed',
                                text2: `${message}`,
                            });
                        }
                    },
                },
            ]
        );
    };

    const sendDiscountAlert = async (item) => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.post(
                `${baseURL}discounts/${item.id}/alert`,
                {},
                { headers }
            );

            const attemptedCount = Number(response?.data?.attemptedCount || 0);
            const sentCount = Number(response?.data?.sentCount || 0);
            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: 'Discount alert sent',
                text2: `Delivered ${sentCount}/${attemptedCount} notifications.`,
            });
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unable to send alert';
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Alert failed',
                text2: `${message}`,
            });
        }
    };

    const header = useMemo(() => (
        <View style={styles.headerWrap}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                    if (isFormVisible) {
                        closeForm();
                        return;
                    }
                    openCreateForm();
                }}
            >
                <Text style={styles.actionButtonText}>
                    {isFormVisible ? 'CLOSE FORM' : 'CREATE DISCOUNT'}
                </Text>
            </TouchableOpacity>

            {isFormVisible ? (
                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>{isEditing ? 'Edit Discount' : 'Create Discount'}</Text>
                    <Input
                        placeholder={'Code (ex: SUMMER20)'}
                        value={form.code}
                        onChangeText={(text) => onChangeField('code', (text || '').toUpperCase())}
                    />
                    <Input
                        placeholder={'Description (optional)'}
                        value={form.description}
                        onChangeText={(text) => onChangeField('description', text)}
                    />
                    <View style={styles.pickerWrap}>
                        <Picker
                            selectedValue={form.type}
                            onValueChange={(itemValue) => onChangeField('type', itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Percentage" value="percentage" />
                            <Picker.Item label="Fixed Amount" value="fixed" />
                        </Picker>
                    </View>
                    <Input
                        placeholder={form.type === 'percentage' ? 'Value (e.g. 10 for 10%)' : 'Value (fixed amount)'}
                        value={form.value}
                        onChangeText={(text) => onChangeField('value', text)}
                        keyboardType={'decimal-pad'}
                    />
                    <Input
                        placeholder={'Minimum order amount'}
                        value={form.minOrderAmount}
                        onChangeText={(text) => onChangeField('minOrderAmount', text)}
                        keyboardType={'decimal-pad'}
                    />
                    <Input
                        placeholder={'Max discount amount (optional)'}
                        value={form.maxDiscountAmount}
                        onChangeText={(text) => onChangeField('maxDiscountAmount', text)}
                        keyboardType={'decimal-pad'}
                    />
                    <Input
                        placeholder={'Usage limit (optional)'}
                        value={form.usageLimit}
                        onChangeText={(text) => onChangeField('usageLimit', text)}
                        keyboardType={'number-pad'}
                    />
                    <Input
                        placeholder={'Expires at YYYY-MM-DD (optional)'}
                        value={form.expiresAt}
                        onChangeText={(text) => onChangeField('expiresAt', text)}
                    />

                    <View style={styles.formButtonsRow}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, styles.formButtonHalf]}
                            onPress={closeForm}
                            disabled={submitting}
                        >
                            <Text style={styles.secondaryButtonText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.formButtonHalf, submitting && styles.actionButtonDisabled]}
                            onPress={submitForm}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color={colors.surface} />
                            ) : (
                                <Text style={styles.actionButtonText}>{isEditing ? 'SAVE CHANGES' : 'CREATE DISCOUNT'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}
        </View>
    ), [isFormVisible, isEditing, form, submitting]);

    const renderItem = ({ item }) => (
        <View style={styles.discountCard}>
            <View style={styles.discountHeader}>
                <Text style={styles.discountCode}>{item.code}</Text>
                <View style={[styles.statusPill, item.isActive ? styles.statusActive : styles.statusInactive]}>
                    <Text style={styles.statusText}>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
                </View>
            </View>
            <Text style={styles.discountLine}>
                {item.type === 'percentage' ? `${item.value}% off` : `PHP ${Number(item.value || 0).toFixed(2)} off`}
            </Text>
            <Text style={styles.discountLine}>Min order: PHP {Number(item.minOrderAmount || 0).toFixed(2)}</Text>
            {item.maxDiscountAmount ? (
                <Text style={styles.discountLine}>Max discount: PHP {Number(item.maxDiscountAmount || 0).toFixed(2)}</Text>
            ) : null}
            {item.expiresAt ? (
                <Text style={styles.discountLine}>Expires: {new Date(item.expiresAt).toLocaleDateString()}</Text>
            ) : null}
            <Text style={styles.discountLine}>Used: {Number(item.timesUsed || 0)} times</Text>
        </View>
    );

    const renderHiddenItem = ({ item }) => (
        <View style={styles.hiddenRow}>
            <TouchableOpacity
                style={[styles.hiddenButton, styles.alertButton]}
                onPress={() => sendDiscountAlert(item)}
            >
                <Text style={styles.hiddenButtonText}>Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.hiddenButton, styles.editButton]}
                onPress={() => openEditForm(item)}
            >
                <Text style={styles.hiddenButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.hiddenButton, styles.deleteButton]}
                onPress={() => deleteDiscount(item)}
            >
                <Text style={styles.hiddenButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SwipeListView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            data={items}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={header}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            leftOpenValue={0}
            rightOpenValue={-252}
            stopRightSwipe={-252}
            disableRightSwipe={true}
            directionalDistanceChangeThreshold={4}
            swipeToOpenPercent={12}
            swipeToClosePercent={20}
            closeOnRowPress={true}
            closeOnScroll={true}
            ListEmptyComponent={
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>No discounts yet. Tap Create Discount above.</Text>
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    headerWrap: {
        marginBottom: spacing.md,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    formCard: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        marginTop: spacing.md,
    },
    sectionTitle: {
        color: colors.primary,
        fontWeight: '900',
        fontSize: 18,
        marginBottom: spacing.sm,
    },
    pickerWrap: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginVertical: spacing.sm,
    },
    picker: {
        width: '100%',
    },
    actionButton: {
        width: '100%',
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    actionButtonDisabled: {
        opacity: 0.75,
    },
    secondaryButton: {
        width: '100%',
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.text,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    actionButtonText: {
        color: colors.surface,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    formButtonsRow: {
        marginTop: spacing.md,
        flexDirection: 'row',
        gap: spacing.sm,
    },
    formButtonHalf: {
        flex: 1,
    },
    discountCard: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    discountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    discountCode: {
        color: colors.text,
        fontWeight: '900',
        fontSize: 16,
    },
    statusPill: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderWidth: 1,
    },
    statusActive: {
        borderColor: colors.success,
        backgroundColor: '#E6F6ED',
    },
    statusInactive: {
        borderColor: colors.muted,
        backgroundColor: colors.surfaceSoft,
    },
    statusText: {
        fontWeight: '800',
        color: colors.text,
        fontSize: 11,
    },
    discountLine: {
        color: colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    emptyWrap: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.muted,
        fontWeight: '600',
    },
    hiddenRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: spacing.md,
    },
    hiddenButton: {
        width: 84,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.background,
    },
    alertButton: {
        backgroundColor: colors.warning,
    },
    editButton: {
        backgroundColor: colors.primary,
    },
    deleteButton: {
        backgroundColor: colors.danger,
    },
    hiddenButtonText: {
        color: colors.surface,
        fontWeight: '800',
    },
});

export default Discounts;

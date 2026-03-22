import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Surface, Text, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import Banner from '../../Shared/Banner';
import CategoryFilter from './CategoryFilter';
import ProductList from './ProductList';
import SearchedProduct from './SearchedProduct';
import { colors, spacing } from '../../Shared/theme';
import { fetchProducts } from '../../Redux/Actions/productActions';
import { fetchCategories } from '../../Redux/Actions/categoryActions';

var { height } = Dimensions.get('window');

const ProductContainer = ({ route }) => {
    const [productsFiltered, setProductsFiltered] = useState([]);
    const [focus, setFocus] = useState(false);
    const [active, setActive] = useState(-1);
    const [productsCtg, setProductsCtg] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const [priceError, setPriceError] = useState('');
    const [priceFilterExpanded, setPriceFilterExpanded] = useState(false);
    const dispatch = useDispatch();
    const { items: products, loading: productsLoading } = useSelector((state) => state.products);
    const { items: categories } = useSelector((state) => state.categories);
    const isSearching =
        keyword.trim().length > 0 ||
        selectedCategory !== 'all' ||
        minPrice.trim().length > 0 ||
        maxPrice.trim().length > 0;

    const getCategoryId = (product) => {
        if (!product || !product.category) return null;
        if (typeof product.category === 'string') return product.category;
        return product.category._id || product.category.id || product.category.$oid || null;
    };

    const applyFilters = (allProducts, searchTerm, categoryId, min, max) => {
        const normalizedSearch = (searchTerm || '').trim().toLowerCase();
        const minValue = min !== '' && !Number.isNaN(Number(min)) ? Number(min) : null;
        const maxValue = max !== '' && !Number.isNaN(Number(max)) ? Number(max) : null;

        return allProducts.filter((product) => {
            const name = product?.name ? product.name.toLowerCase() : '';
            const brand = product?.brand ? product.brand.toLowerCase() : '';
            const categoryName = product?.category?.name ? product.category.name.toLowerCase() : '';
            const priceText = product?.price !== undefined && product?.price !== null ? `${product.price}`.toLowerCase() : '';

            const matchesSearch =
                normalizedSearch === '' ||
                name.includes(normalizedSearch) ||
                brand.includes(normalizedSearch) ||
                categoryName.includes(normalizedSearch) ||
                priceText.includes(normalizedSearch);

            const productCategoryId = getCategoryId(product);
            const matchesCategory = categoryId === 'all' || productCategoryId === categoryId;

            const price = Number(product?.price);
            const hasValidPrice = !Number.isNaN(price);
            const matchesMin = minValue === null || (hasValidPrice && price >= minValue);
            const matchesMax = maxValue === null || (hasValidPrice && price <= maxValue);

            return matchesSearch && matchesCategory && matchesMin && matchesMax;
        });
    };

    const searchProduct = (text) => {
        setKeyword(text);
        setFocus(text.trim().length > 0);
    };

    const changeCtg = (ctg) => {
        setSelectedCategory(ctg);
    };

    useEffect(() => {
        if (route?.params?.openSearch) {
            if (typeof route?.params?.headerSearchText === 'string') {
                setKeyword(route.params.headerSearchText);
                setFocus(route.params.headerSearchText.trim().length > 0);
            }
            return;
        }

        if (route?.params?.headerSearchText === '') {
            setKeyword('');
            setFocus(false);
        }
    }, [route?.params?.openSearch, route?.params?.headerSearchText]);

    useEffect(() => {
        const minValue = minPrice !== '' && !Number.isNaN(Number(minPrice)) ? Number(minPrice) : null;
        const maxValue = maxPrice !== '' && !Number.isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

        if (minValue !== null && maxValue !== null && minValue > maxValue) {
            setPriceError('Min Price cannot be greater than Max Price.');
            const filteredWithoutPrice = applyFilters(products, keyword, selectedCategory, '', '');
            setProductsFiltered(filteredWithoutPrice);
            setProductsCtg(filteredWithoutPrice);
            return;
        }

        setPriceError('');
        const filtered = applyFilters(products, keyword, selectedCategory, minPrice, maxPrice);
        setProductsFiltered(filtered);
        setProductsCtg(filtered);
    }, [products, keyword, selectedCategory, minPrice, maxPrice]);

    useFocusEffect(
        useCallback(() => {
            setFocus(false);
            setActive(-1);
            setSelectedCategory('all');
            setMinPrice('');
            setMaxPrice('');
            setKeyword('');
            dispatch(fetchProducts())
                .catch((error) => {
                    console.log('Api call error', error);
                });
            dispatch(fetchCategories())
                .catch((error) => {
                    console.log('Api categories call error', error);
                });

            return () => {
                setFocus(false);
                setActive(-1);
                setSelectedCategory('all');
                setMinPrice('');
                setMaxPrice('');
                setKeyword('');
            };
        }, [dispatch])
    );

    useEffect(() => {
        setLoading(productsLoading);
    }, [productsLoading]);

    const renderFilters = (compact = false) => (
        <View style={[styles.filtersSection, compact ? styles.filtersSectionCompact : null]}>
            <View style={styles.searchCard}>
                <Ionicons name="search" size={18} color={colors.muted} />
                <TextInput
                    mode="flat"
                    value={keyword}
                    onChangeText={searchProduct}
                    placeholder="Search by name, brand, or price"
                    placeholderTextColor={colors.muted}
                    style={styles.searchInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                />
                {keyword ? (
                    <TouchableOpacity onPress={() => searchProduct('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Ionicons name="close-circle" size={18} color={colors.muted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            <TouchableOpacity
                style={styles.filterToggleButton}
                activeOpacity={0.85}
                onPress={() => setPriceFilterExpanded((prev) => !prev)}
            >
                <View style={styles.filterToggleLeft}>
                    <Ionicons name="options-outline" size={18} color={colors.text} />
                    <Text style={styles.filterToggleText}>Price Filter</Text>
                </View>
                <Ionicons
                    name={priceFilterExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.muted}
                />
            </TouchableOpacity>

            {priceFilterExpanded ? (
                <View style={styles.priceFilterContainer}>
                    <View style={styles.priceField}>
                        <Text style={styles.priceLabel}>MIN PRICE</Text>
                        <View style={styles.priceInputRow}>
                            <View style={styles.currencyBadge}>
                                <Text style={styles.currencyText}>$</Text>
                            </View>
                            <TextInput
                                mode="flat"
                                value={minPrice}
                                onChangeText={setMinPrice}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.muted}
                                style={styles.priceInput}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                            />
                        </View>
                    </View>

                    <View style={styles.priceField}>
                        <Text style={styles.priceLabel}>MAX PRICE</Text>
                        <View style={styles.priceInputRow}>
                            <View style={styles.currencyBadge}>
                                <Text style={styles.currencyText}>$</Text>
                            </View>
                            <TextInput
                                mode="flat"
                                value={maxPrice}
                                onChangeText={setMaxPrice}
                                keyboardType="numeric"
                                placeholder="9999"
                                placeholderTextColor={colors.muted}
                                style={styles.priceInput}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                            />
                        </View>
                    </View>
                </View>
            ) : null}

            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
        </View>
    );

    return (
        <Surface style={styles.container}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : null}

            {isSearching ? (
                <View style={styles.focusContainer}>
                    <CategoryFilter
                        categories={categories}
                        categoryFilter={changeCtg}
                        active={active}
                        setActive={setActive}
                        compact
                    />
                    {renderFilters(true)}
                    <SearchedProduct productsFiltered={productsFiltered} />
                </View>
            ) : (
                <ScrollView>
                    <Banner />
                    <CategoryFilter
                        categories={categories}
                        categoryFilter={changeCtg}
                        active={active}
                        setActive={setActive}
                    />
                    {renderFilters()}

                    {productsCtg.length > 0 ? (
                    <View style={styles.listContainer}>
                        {productsCtg.map((item) => (
                            <ProductList key={item.id} item={item} />
                        ))}
                    </View>
                    ) : (
                        <View style={[styles.center, { height: height / 2 }]}>
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: spacing.md,
    },
    searchWrap: {
        paddingBottom: spacing.sm,
    },
    focusContainer: {
        flex: 1,
    },
    filtersSection: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
    },
    filtersSectionCompact: {
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
        paddingTop: spacing.sm,
    },
    searchCard: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'transparent',
        color: colors.text,
        paddingHorizontal: spacing.xs,
    },
    filterToggleButton: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    filterToggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    filterToggleText: {
        color: colors.primary,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    priceFilterContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    priceField: {
        flex: 1,
    },
    priceLabel: {
        color: colors.muted,
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 0.8,
        marginBottom: spacing.xs,
    },
    priceInputRow: {
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    currencyBadge: {
        width: 28,
        height: 28,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.xs,
    },
    currencyText: {
        color: colors.primary,
        fontWeight: '800',
    },
    priceInput: {
        flex: 1,
        backgroundColor: 'transparent',
        color: colors.text,
        paddingHorizontal: 0,
    },
    errorText: {
        color: colors.danger,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        fontWeight: '700',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: colors.muted,
        fontWeight: '700',
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.xl,
    },
});

export default ProductContainer;

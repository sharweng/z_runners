import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollView } from 'react-native'
import { Surface, Text, TextInput, Searchbar } from 'react-native-paper';
import { Ionicons } from "@expo/vector-icons";
import ProductList from './ProductList'
import SearchedProduct from "./SearchedProduct";
import Banner from "../../Shared/Banner";
import CategoryFilter from "./CategoryFilter";
import axios from "axios";
import baseURL from "../../constants/baseurl";
import { useFocusEffect } from '@react-navigation/native';

// const data = require('../../data/products.json')
// const productCategories = require('../../data/categories.json')
var { height, width } = Dimensions.get('window')
const ProductContainer = () => {

    const [products, setProducts] = useState([])
    const [productsFiltered, setProductsFiltered] = useState([]);
    const [focus, setFocus] = useState('');
    const [categories, setCategories] = useState([]);
    const [active, setActive] = useState([]);
    const [initialState, setInitialState] = useState([])
    const [productsCtg, setProductsCtg] = useState([])
    const [keyword, setKeyword] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [loading, setLoading] = useState(true)
    const [priceError, setPriceError] = useState('')

    // useEffect(() => {
    //     setProducts(data);
    //     setProductsFiltered(data);
    //     setFocus(false);
    //     setCategories(productCategories)
    //     setActive(-1)
    //     setInitialState(data);
    //     setProductsCtg(data)

    //     return () => {
    //         setProducts([])
    //         setProductsFiltered([]);
    //         setFocus();
    //         setCategories([])
    //         setActive()
    //         setInitialState();
    //     }
    // }, [])

    const getCategoryId = (product) => {
        if (!product || !product.category) return null;
        if (typeof product.category === 'string') return product.category;
        return product.category._id || product.category.id || product.category.$oid || null;
    };

    const applyFilters = (allProducts, searchTerm, categoryId, min, max) => {
        const minValue = min !== '' && !Number.isNaN(Number(min)) ? Number(min) : null;
        const maxValue = max !== '' && !Number.isNaN(Number(max)) ? Number(max) : null;

        return allProducts.filter((product) => {
            const name = product?.name ? product.name.toLowerCase() : '';
            const matchesSearch = name.includes(searchTerm.toLowerCase());

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
    }
    const openList = () => {
        setFocus(true);
    }

    const onBlur = () => {
        setFocus(false);
    }

    // const changeCtg = (ctg) => {
    //     {
    //         ctg === "all"
    //             ? [setProductsCtg(initialState), setActive(true)]
    //             : [
    //                 setProductsCtg(
    //                     products.filter((i) => i.category.$oid === ctg),
    //                     setActive(true)
    //                 ),
    //             ];
    //     }
    // };

    const changeCtg = (ctg) => {
        setSelectedCategory(ctg);
    };

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

    useFocusEffect((
        useCallback(
            () => {
                setFocus(false);
                setActive(-1);
                setSelectedCategory('all');
                setMinPrice('');
                setMaxPrice('');
                setKeyword('');
                setLoading(true)
                // Products
                axios
                    .get(`${baseURL}products`)
                    .then((res) => {
                        setProducts(res.data);
                        setInitialState(res.data);
                        setLoading(false)
                    })
                    .catch((error) => {
                        console.log('Api call error')
                        setLoading(false)
                    })

                // Categories
                axios
                    .get(`${baseURL}categories`)
                    .then((res) => {

                        setCategories(res.data)
                    })
                    .catch((error) => {
                        console.log('Api categoriesv call error')
                    })

                return () => {
                    setProducts([]);
                    setProductsFiltered([]);
                    setFocus();
                    setCategories([]);
                    setActive();
                    setInitialState();
                    setProductsCtg([]);
                    setSelectedCategory('all');
                    setMinPrice('');
                    setMaxPrice('');
                    setKeyword('');
                };
            },
            [],
        )
    ))

    return (
        <Surface width="100%" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

            <Searchbar
                placeholder="Search"
                onChangeText={(text) => [searchProduct(text), setFocus(true)]}
                value={keyword}

                onClearIconPress={() => {
                    setKeyword('');
                    onBlur();
                }}

            />

            <View style={styles.priceFilterContainer}>
                <TextInput
                    mode="outlined"
                    label="Min Price"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    style={styles.priceInput}
                />
                <TextInput
                    mode="outlined"
                    label="Max Price"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    style={styles.priceInput}
                />
            </View>
            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#03bafc" />
                </View>
            ) : null}

            {focus === true ? (
                <SearchedProduct
                    productsFiltered={productsFiltered}
                />
            ) : (

                <ScrollView>
                    <View>
                        <Banner />
                    </View>
                    <View >
                        <CategoryFilter
                            categories={categories}
                            categoryFilter={changeCtg}
                            active={active}
                            setActive={setActive}
                        />
                    </View>
                    {productsCtg.length > 0 ? (
                        <View style={styles.listContainer}>
                            {productsCtg.map((item) => {
                                return (
                                    <ProductList

                                        key={item.id}
                                        item={item}
                                    />
                                )
                            })}
                        </View>
                    ) : (
                        <View style={[styles.center, { height: height / 2 }]}>
                            <Text>No products found</Text>
                        </View>
                    )}
                </ScrollView>



            )}




        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        flexWrap: "wrap",
        backgroundColor: "gainsboro",
    },
    listContainer: {
        height: height,
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
        backgroundColor: "gainsboro",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    priceFilterContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 8,
        gap: 10
    },
    priceInput: {
        flex: 1,
        backgroundColor: 'white'
    },
    errorText: {
        color: '#d32f2f',
        width: '100%',
        paddingHorizontal: 12,
        marginBottom: 6
    }
});

export default ProductContainer;
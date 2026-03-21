import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    RefreshControl,

} from "react-native";
// import { Input, VStack, Heading, Box } from "native-base"
// import Icon from "react-native-vector-icons/FontAwesome"
import { useFocusEffect } from "@react-navigation/native"
import { Searchbar } from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';
import ListItem from "./ListItem"

var { height, width } = Dimensions.get("window")
import { useNavigation } from "@react-navigation/native"
import { colors, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct as deleteProductAction, fetchProducts } from '../../Redux/Actions/productActions';
import { getJwtToken } from "../../utils/tokenStorage";

const Products = (props) => {

    const [productFilter, setProductFilter] = useState([]);
    const [token, setToken] = useState();
    const navigation = useNavigation()
    const [refreshing, setRefreshing] = useState(false);
    const dispatch = useDispatch();
    const { items: productList, loading } = useSelector((state) => state.products);
    const ListHeader = () => {
        return (
            <View
                elevation={1}
                style={styles.listHeader}
            >
                <View style={styles.headerItem}></View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Brand</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Name</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Category</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Price</Text>
                </View>
            </View>
        )
    }
    const searchProduct = (text) => {
        const query = (text || "").trim().toLowerCase();

        if (!query) {
            setProductFilter(productList || []);
            return;
        }

        setProductFilter(
            (productList || []).filter((i) => {
                const name = (i?.name || "").toLowerCase();
                const brand = (i?.brand || "").toLowerCase();
                const category = (i?.category?.name || "").toLowerCase();
                const price = `${i?.price ?? ""}`.toLowerCase();

                return (
                    name.includes(query) ||
                    brand.includes(query) ||
                    category.includes(query) ||
                    price.includes(query)
                );
            })
        );
    }

    const handleDeleteProduct = (id) => {
        dispatch(deleteProductAction(id, token)).catch((error) => console.log(error));
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        dispatch(fetchProducts())
            .finally(() => setRefreshing(false));
    }, [dispatch]);

    const renderHiddenItem = ({ item }) => (
        <View style={styles.hiddenRow}>
            <TouchableOpacity
                style={[styles.hiddenButton, styles.editButton]}
                onPress={() => navigation.navigate("ProductForm", { item })}
            >
                <Text style={styles.hiddenButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.hiddenButton, styles.deleteButton]}
                onPress={() => handleDeleteProduct(item.id)}
            >
                <Text style={styles.hiddenButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    useFocusEffect(
        useCallback(
            () => {
                // Get Token
                getJwtToken()
                    .then((res) => {
                        setToken(res)
                    })
                    .catch((error) => console.log(error))
                dispatch(fetchProducts())
                    .catch((error) => console.log(error));

                return () => {
                    setProductFilter();
                }
            },
            [dispatch],
        )
    )

    React.useEffect(() => {
        setProductFilter(productList || []);
    }, [productList]);
    return (
        <View flex={1}>
            <View style={styles.searchRow}>
                <Searchbar
                    placeholder="Search"
                    onChangeText={(text) => searchProduct(text)}
                    style={styles.searchbar}
                />
                <TouchableOpacity
                    style={styles.addProductSquareButton}
                    onPress={() => navigation.navigate("ProductForm")}
                >
                    <Text style={styles.addProductSquareButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.spinner}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : (<SwipeListView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={ListHeader}
                data={productFilter}
                renderItem={({ item, index }) => (
                    <ListItem
                        item={item}
                        index={index}
                    />
                )}
                renderHiddenItem={renderHiddenItem}
                leftOpenValue={0}
                rightOpenValue={-160}
                stopRightSwipe={-160}
                disableLeftSwipe={false}
                disableRightSwipe={true}
                directionalDistanceChangeThreshold={4}
                swipeToOpenPercent={12}
                swipeToClosePercent={20}
                swipeToOpenVelocityContribution={8}
                closeOnRowPress={true}
                closeOnScroll={true}
                keyExtractor={(item) => item.id}
            />)}


        </View>
    );
}

const styles = StyleSheet.create({
    listHeader: {
        flexDirection: 'row',
        padding: 5,
        backgroundColor: colors.surfaceSoft,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
    },
    headerItem: {
        margin: 3,
        width: width / 6
    },
    spinner: {
        height: height / 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        marginBottom: 160,
        backgroundColor: 'white'
    },
    searchRow: {
        marginTop: spacing.md,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        height: 56,
    },
    searchbar: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 0,
    },
    addProductSquareButton: {
        width: 56,
        height: 56,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addProductSquareButtonText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 28,
        lineHeight: 30,
    },
    hiddenRow: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 0,
        marginBottom: 1,
    },
    hiddenButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: '100%',
    },
    editButton: {
        backgroundColor: colors.primary,
    },
    deleteButton: {
        backgroundColor: colors.danger,
    },
    hiddenButtonText: {
        color: 'white',
        fontWeight: '700',
    }
})

export default Products;
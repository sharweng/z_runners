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
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"
import { Searchbar } from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';
import ListItem from "./ListItem"

import AsyncStorage from '@react-native-async-storage/async-storage'
var { height, width } = Dimensions.get("window")
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import { useNavigation } from "@react-navigation/native"
import { colors, radius, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct as deleteProductAction, fetchProducts } from '../../Redux/Actions/productActions';
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
        if (text === "") {
            setProductFilter(productList)
        }
        setProductFilter(
            productList.filter((i) =>
                i.name.toLowerCase().includes(text.toLowerCase())
            )
        )
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
                AsyncStorage.getItem("jwt")
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
            <View style={styles.buttonContainer}>
                <EasyButton
                    secondary
                    medium
                    onPress={() => navigation.navigate("Orders")}
                >
                    <Ionicons name="bag-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Orders</Text>
                </EasyButton>
                <EasyButton
                    secondary
                    medium
                    onPress={() => navigation.navigate("ProductForm")}
                >
                    <Ionicons name="add-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Products</Text>
                </EasyButton>
                <EasyButton
                    secondary
                    medium
                    onPress={() => navigation.navigate("Categories")}
                >
                    <Ionicons name="add-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Categories</Text>
                </EasyButton>
            </View>
            <Searchbar width="80%"
                placeholder="Search"
                onChangeText={(text) => searchProduct(text)}
            //   value={searchQuery}
                style={styles.searchbar}
            />
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
                disableLeftSwipe={false}
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
        borderTopLeftRadius: radius.md,
        borderTopRightRadius: radius.md,
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
    buttonContainer: {
        margin: 20,
        alignSelf: 'center',
        flexDirection: 'row'
    },
    buttonText: {
        marginLeft: 4,
        color: 'white'
    },
    searchbar: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    hiddenRow: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: spacing.md,
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
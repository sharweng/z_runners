import React from "react";
import { TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

var { width } = Dimensions.get("window")
import ProductCard from "./ProductCard";
import { colors } from "../../Shared/theme";
const ProductList = (props) => {
    const { item } = props;
    const navigation = useNavigation();

    const productId =
        item?.id
        || item?._id
        || (typeof item?._id === 'object' ? item?._id?.$oid : null)
        || null;

    const handleOpenProduct = () => {
        if (!productId) {
            return;
        }

        navigation.navigate('Product Detail', {
            item: {
                ...item,
                id: typeof productId === 'string' ? productId : String(productId),
                _id: typeof productId === 'string' ? productId : String(productId),
            },
        });
    };

    return (
        <TouchableOpacity style={styles.wrapper} activeOpacity={0.9} onPress={handleOpenProduct}>
            <View style={styles.inner}>
                <ProductCard {...item} />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: '50%',
        paddingHorizontal: 4,
    },
    inner: {
        width: '100%',
        backgroundColor: colors.background,
        paddingHorizontal: 2,
    },
});

export default ProductList;
import React from "react";
import { TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";

var { width } = Dimensions.get("window")
import ProductCard from "./ProductCard";
import { colors } from "../../Shared/theme";
const ProductList = (props) => {
    const { item } = props;
    return (
        <TouchableOpacity style={styles.wrapper} activeOpacity={0.9}>
            <View style={styles.inner}>
                <ProductCard {...item} />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: '50%',
    },
    inner: {
        width: '100%',
        backgroundColor: colors.background,
        paddingHorizontal: 6,
    },
});

export default ProductList;
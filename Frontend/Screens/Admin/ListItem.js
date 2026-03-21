import React from "react";
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native"
import { colors, spacing } from "../../Shared/theme";


var { width } = Dimensions.get("window");

const ListItem = ({ item, index }) => {
    const navigation = useNavigation()

    return (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate('Home', { screen: 'Product Detail', params: { item } })
            }}
            style={[styles.container, {
                backgroundColor: index % 2 == 0 ? colors.surface : colors.surfaceSoft
            }]}
        >
            <Image
                source={{
                    uri: item.image
                        ? item.image
                        : null
                }}
                resizeMode="contain"
                style={styles.image}
            />
            <Text style={styles.item}>{item.brand}</Text>
            <Text style={styles.item} numberOfLines={1} ellipsizeMode="tail">{item.name ? item.name : null}</Text>
            <Text style={styles.item} numberOfLines={1} ellipsizeMode="tail">{item.category ? item.category.name : null}</Text>
            <Text style={styles.item}>$ {item.price}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: spacing.sm,
        width: width,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    image: {
        width: width / 6,
        height: 32,
        margin: 2
    },
    item: {
        flexWrap: "wrap",
        margin: 3,
        width: width / 6,
        color: colors.text,
    },

})

export default ListItem;
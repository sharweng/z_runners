import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../Shared/theme';

const SearchedProduct = ({ productsFiltered = [] }) => {
    const navigation = useNavigation();

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.row}
            onPress={() => navigation.navigate('Product Detail', { item })}
        >
            <Image
                style={styles.thumb}
                resizeMode="cover"
                source={{
                    uri: item?.image || 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png',
                }}
            />
            <View style={styles.metaWrap}>
                <Text style={styles.name} numberOfLines={1}>{item?.name || 'Unnamed Product'}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item?.description || 'No description available'}</Text>
                <Text style={styles.price}>${(Number(item?.price) || 0).toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {productsFiltered.length > 0 ? (
                <FlatList
                    data={productsFiltered}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => String(item?.id || item?._id || index)}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No products match the selected criteria</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: spacing.lg,
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    thumb: {
        width: 84,
        height: 84,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        backgroundColor: colors.surfaceSoft,
    },
    metaWrap: {
        flex: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    name: {
        color: colors.text,
        fontWeight: '800',
        marginBottom: 2,
    },
    desc: {
        color: colors.muted,
        fontSize: 12,
        marginBottom: spacing.xs,
    },
    price: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '800',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    emptyText: {
        color: colors.muted,
        fontWeight: '700',
    },
});

export default SearchedProduct;

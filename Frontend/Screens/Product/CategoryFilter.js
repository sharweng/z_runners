import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { colors, spacing } from '../../Shared/theme';

const formatLabel = (value) => {
    if (!value) return '';
    return value
        .toString()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const CategoryFilter = (props) => {
    return (
        <ScrollView
            bounces={true}
            horizontal={true}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.row}>
                <TouchableOpacity
                    key={1}
                    activeOpacity={0.85}
                    onPress={() => {
                        props.categoryFilter('all');
                        props.setActive(-1);
                    }}
                    style={[styles.chip, props.active === -1 ? styles.active : styles.inactive]}
                >
                    <Text style={[styles.chipText, props.active === -1 ? styles.activeText : styles.inactiveText]}>All</Text>
                </TouchableOpacity>
                {props.categories.map((item) => {
                    const index = props.categories.indexOf(item);
                    const isActive = props.active === index;

                    return (
                        <TouchableOpacity
                            key={item._id}
                            activeOpacity={0.85}
                            onPress={() => {
                                props.categoryFilter(item._id);
                                props.setActive(index);
                            }}
                            style={[styles.chip, isActive ? styles.active : styles.inactive]}
                        >
                            <Text style={[styles.chipText, isActive ? styles.activeText : styles.inactiveText]}>
                                {formatLabel(item.name)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>


    )
}

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    chip: {
        minHeight: 36,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        alignItems: 'center'
    },
    active: {
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    inactive: {
        backgroundColor: colors.surfaceSoft,
        borderWidth: 2,
        borderColor: colors.border,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    activeText: {
        color: colors.surface,
    },
    inactiveText: {
        color: colors.text,
    },
})

export default CategoryFilter;
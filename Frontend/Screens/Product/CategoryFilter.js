import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { colors, spacing } from '../../Shared/theme';

const formatLabel = (value) => {
    if (!value) return '';
    return value
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|[\s-])([a-z])/g, (match, boundary, char) => `${boundary}${char.toUpperCase()}`);
};

const CategoryFilter = (props) => {
    const isCompact = !!props.compact;

    return (
        <ScrollView
            bounces={true}
            horizontal={true}
            style={[styles.scroll, isCompact ? styles.scrollCompact : null]}
            contentContainerStyle={[styles.content, isCompact ? styles.contentCompact : null]}
            showsHorizontalScrollIndicator={false}
        >
            <View style={[styles.row, isCompact ? styles.rowCompact : null]}>
                <TouchableOpacity
                    key={1}
                    activeOpacity={0.85}
                    onPress={() => {
                        props.categoryFilter('all');
                        props.setActive(-1);
                    }}
                    style={[styles.chip, isCompact ? styles.chipCompact : null, props.active === -1 ? styles.active : styles.inactive]}
                >
                    <Text style={[styles.chipText, isCompact ? styles.chipTextCompact : null, props.active === -1 ? styles.activeText : styles.inactiveText]}>All</Text>
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
                            style={[styles.chip, isCompact ? styles.chipCompact : null, isActive ? styles.active : styles.inactive]}
                        >
                            <Text style={[styles.chipText, isCompact ? styles.chipTextCompact : null, isActive ? styles.activeText : styles.inactiveText]}>
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
    scrollCompact: {
        maxHeight: 44,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    contentCompact: {
        paddingVertical: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    rowCompact: {
        gap: spacing.xs,
    },
    chip: {
        minHeight: 36,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        alignItems: 'center'
    },
    chipCompact: {
        minHeight: 28,
        paddingHorizontal: spacing.sm,
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
    },
    chipTextCompact: {
        fontSize: 11,
    },
    activeText: {
        color: colors.surface,
    },
    inactiveText: {
        color: colors.text,
    },
})

export default CategoryFilter;
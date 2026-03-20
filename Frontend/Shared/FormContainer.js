import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from './theme';

const FormContainer = ({children, title}) => {
    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <View style={styles.card}>
                {children}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        width: '100%',
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.xs,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    helper: {
        width: '100%',
    },
})

export default FormContainer;
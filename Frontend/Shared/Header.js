import React from "react"
import { StyleSheet, Image, View, Text } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from './theme';

const Header = () => {
    return (
        <SafeAreaView style={styles.header}>
            <View style={styles.brandRow}>
                <View style={styles.logoWrap}>
                    <Image
                        source={require("../assets/Logo.png")}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </View>
                <View>
                    <Text style={styles.brandName}>Zone Runners</Text>
                    <Text style={styles.brandTag}>Classic sports essentials</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadow,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    logoWrap: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 28,
        height: 28,
    },
    brandName: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    brandTag: {
        marginTop: 2,
        fontSize: 12,
        color: colors.muted,
    }
})

export default Header;
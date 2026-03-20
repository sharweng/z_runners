import React, { useState, useEffect } from "react";
import { Image, View, StyleSheet, Text, ScrollView, Button } from "react-native";
import { Surface, } from "react-native-paper";
import { colors, radius, shadow, spacing } from "../../Shared/theme";

const SingleProduct = ({ route }) => {
    console.log(route)
    const [item, setItem] = useState(route.params.item);


    return (
        <Surface style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroWrap}>
                    <Image
                        source={{
                            uri: item.image ? item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }}
                        resizeMode="contain"
                        style={styles.image}
                    />

                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.contentHeader} size='xl'>{item.name}</Text>
                    <Text style={styles.contentText}>{item.brand}</Text>
                </View>
                <View style={styles.detailCard}>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </ScrollView>
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 40,
        backgroundColor: colors.background,
    },
    heroWrap: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 280,
    },
    contentContainer: {
        marginTop: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentHeader: {
        fontWeight: 'bold',
        fontSize: 24,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    contentText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.muted,
        marginBottom: spacing.md
    },
    detailCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        ...shadow,
    },
    description: {
        color: colors.text,
        lineHeight: 22,
    }
})

export default SingleProduct
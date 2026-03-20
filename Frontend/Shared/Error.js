import React from "react"
import { StyleSheet, View, Text } from 'react-native'
import { colors, radius, spacing } from './theme'

const Error = (props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{props.message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginVertical: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: '#FDECEC',
        borderWidth: 1,
        borderColor: '#F4C2C2',
    },
    text: {
        color: colors.danger,
        fontWeight: '700',
    }
})

export default Error;
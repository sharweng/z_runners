import React from 'react';
import { TextInput, StyleSheet } from 'react-native'
import { colors, radius, spacing } from './theme';

const Input = (props) => {
    return (
        <TextInput
            style={styles.input}
            placeholder={props.placeholder}
            placeholderTextColor={colors.muted}
            name={props.name}
            id={props.id}
            value={props.value}
            autoCorrect={props.autoCorrect}
            onChangeText={props.onChangeText}
            onFocus={props.onFocus}
            secureTextEntry={props.secureTextEntry}
            keyboardType={props.keyboardType}
        >
        </TextInput>
    );
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        minHeight: 56,
        backgroundColor: colors.surface,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
    },
});

export default Input;
import React from 'react';
import { TextInput, StyleSheet } from 'react-native'
import { colors, spacing } from './theme';

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
        minHeight: 52,
        backgroundColor: colors.surface,
        marginVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        color: colors.text,
        fontWeight: '500',
    },
});

export default Input;
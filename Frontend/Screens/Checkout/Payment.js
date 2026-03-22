import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, RadioButton, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import FormContainer from '../../Shared/FormContainer';
import { colors, spacing } from '../../Shared/theme';

const methods = [
  { name: 'Cash on Delivery', value: 1 },
  { name: 'Bank Transfer', value: 2 },
  { name: 'Card Payment', value: 3 },
];

const paymentCards = [
  { name: 'Wallet', value: 1 },
  { name: 'Visa', value: 2 },
  { name: 'MasterCard', value: 3 },
  { name: 'Other', value: 4 },
];

const Payment = ({ route }) => {
  const order = route?.params?.order;
  const quote = route?.params?.quote;
  const [selected, setSelected] = useState(null);
  const [card, setCard] = useState('');
  const navigation = useNavigation();

  const isConfirmDisabled = selected === null || selected === '' || (selected === 3 && !card);

  const handleConfirmPayment = () => {
    if (selected === null || selected === '') {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Select a payment method',
        text2: 'Choose one of the options before continuing.',
      });
      return;
    }

    const paymentMethod = selected === 3
      ? (card || 'Card')
      : (methods.find((m) => m.value === selected)?.name || 'Cash on Delivery');

    const paymentToken = `tok_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    navigation.navigate('Confirm', {
      order,
      quote,
      paymentMethod,
      paymentToken,
    });
  };

  return (
    <View style={styles.screen}>
      <FormContainer title={'Payment Method'}>
        <Surface style={styles.card}>
          <RadioButton.Group
            name="paymentMethod"
            value={selected}
            onValueChange={(value) => setSelected(value)}
          >
            {methods.map((item) => (
              <RadioButton.Item
                key={item.value}
                value={item.value}
                color={colors.primary}
                size={18}
                label={item.name}
              />
            ))}
          </RadioButton.Group>
        </Surface>

        {selected === 3 ? (
          <Surface style={styles.card}>
            <Picker
              style={styles.picker}
              selectedValue={card}
              dropdownIconColor={colors.text}
              onValueChange={(itemValue) => setCard(itemValue)}
            >
              <Picker.Item label="Select Card Type" value="" color={colors.muted} />
              {paymentCards.map((item) => (
                <Picker.Item key={item.value} label={item.name} value={item.name} color={colors.text} />
              ))}
            </Picker>
          </Surface>
        ) : null}

        <View style={styles.buttonWrap}>
          <TouchableOpacity
            style={[styles.actionButton, isConfirmDisabled && styles.actionButtonDisabled]}
            onPress={handleConfirmPayment}
            disabled={isConfirmDisabled}
          >
            <Text style={styles.actionButtonText}>CONFIRM PAYMENT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Shipping')}
          >
            <Text style={styles.secondaryButtonText}>BACK TO SHIPPING</Text>
          </TouchableOpacity>
        </View>
      </FormContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  picker: {
    height: 56,
    width: '100%',
    color: colors.text,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonWrap: {
    marginTop: spacing.xl,
    width: '100%',
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: colors.surface,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default Payment;

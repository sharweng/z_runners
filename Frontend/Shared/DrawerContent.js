import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Drawer } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from './theme';



const DrawerContent = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandName}>Zone Runners</Text>
        <Text style={styles.brandTag}>Simple sports shopping</Text>
      </View>
      <Drawer.Section>
      <Drawer.Item
        label="My Profile"
        onPress={() =>
          navigation.navigate('Zone Runners', {
            screen: 'User',
            params: { screen: 'User Profile' },
          })
        }
        icon="account"
      />
      <Drawer.Item
        label="My Orders"
        onPress={() =>
          navigation.navigate('Zone Runners', {
            screen: 'My Orders',
          })
        }
        icon="cart-variant"
      />
      <Drawer.Item
        label="Cart"
        onPress={() =>
          navigation.navigate('Zone Runners', {
            screen: 'Cart Screen',
            params: { screen: 'Cart' },
          })
        }
        icon="history"
      />
      <Drawer.Item
        label="Notifications"
        onPress={() => {}}
        icon="bell"
      />

      </Drawer.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 48,
  },
  brandBlock: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  brandTag: {
    marginTop: 4,
    color: colors.muted,
  },
});

export default DrawerContent;
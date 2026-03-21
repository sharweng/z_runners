import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Drawer } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from './theme';
import AuthGlobal from '../Context/Store/AuthGlobal';
import Toast from 'react-native-toast-message';



const DrawerContent = () => {
  const navigation = useNavigation();
  const context = useContext(AuthGlobal);
  const isAdmin = !!context?.stateUser?.user?.isAdmin;
  const isAuthenticated = !!context?.stateUser?.isAuthenticated;

  const navigateToCart = () => {
    if (!isAuthenticated) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Please login first',
        text2: 'Sign in to access your cart.',
      });
      navigation.navigate('Zone Runners', {
        screen: 'User',
        params: { screen: 'Login' },
      });
      return;
    }

    navigation.navigate('Zone Runners', {
      screen: 'Cart Screen',
      params: { screen: 'Cart' },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandName}>Zone Runners</Text>
        <Text style={styles.brandTag}>Simple sports shopping</Text>
      </View>
      <Drawer.Section>
      <Drawer.Item
        label="Home"
        onPress={() =>
          navigation.navigate('Zone Runners', {
            screen: 'Home',
          })
        }
        icon="home"
      />
      <Drawer.Item
        label="Cart"
        onPress={navigateToCart}
        icon="cart"
      />
      {!isAdmin ? (
        <Drawer.Item
          label="My Orders"
          onPress={() =>
            navigation.navigate('Zone Runners', {
              screen: 'My Orders',
            })
          }
          icon="receipt"
        />
      ) : (
        <Drawer.Item
          label="Admin"
          onPress={() =>
            navigation.navigate('Zone Runners', {
              screen: 'Admin',
            })
          }
          icon="shield-account"
        />
      )}
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
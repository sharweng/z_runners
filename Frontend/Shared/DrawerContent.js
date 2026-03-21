import React, { useContext } from 'react';
import { Drawer } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from './theme';
import AuthGlobal from '../Context/Store/AuthGlobal';
import Toast from 'react-native-toast-message';

const DrawerContent = ({ navigation }) => {
  const context = useContext(AuthGlobal);
  const isAdmin = !!context?.stateUser?.user?.isAdmin;
  const isAuthenticated = !!context?.stateUser?.isAuthenticated;
  const profileLabel = isAuthenticated ? 'My Profile' : 'Login';

  const navigateFromDrawer = (params) => {
    navigation.closeDrawer();
    setTimeout(() => {
      navigation.navigate('Zone Runners', params);
    }, 140);
  };

  const navigateToCart = () => {
    if (!isAuthenticated) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Please login first',
        text2: 'Sign in to access your cart.',
      });
      navigateFromDrawer({
        screen: 'User',
        params: { screen: 'Login' },
      });
      return;
    }

    navigateFromDrawer({
      screen: 'Cart Screen',
      params: { screen: 'Cart' },
    });
  };

  const navigateToHome = () => {
    navigateFromDrawer({
      screen: 'Home',
      params: {
        screen: 'Main',
        params: {
          openSearch: false,
          headerSearchText: '',
        },
      },
    });
  };

  const navigateToMyOrders = () => {
    if (!isAuthenticated) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Please login first',
        text2: 'Sign in to view your orders.',
      });
      navigateFromDrawer({
        screen: 'User',
        params: { screen: 'Login' },
      });
      return;
    }

    navigateFromDrawer({
      screen: 'My Orders',
      params: { screen: 'My Orders List' },
    });
  };

  const navigateToAdmin = () => {
    navigateFromDrawer({
      screen: 'Admin',
      params: { screen: 'Products' },
    });
  };

  const navigateToLogin = () => {
    navigateFromDrawer({
      screen: 'User',
      params: { screen: 'Login' },
    });
  };

  const navigateToProfile = () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }

    navigateFromDrawer({
      screen: 'User',
      params: { screen: 'User Profile' },
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
        onPress={navigateToHome}
        icon="home"
      />
      <Drawer.Item
        label="Cart"
        onPress={navigateToCart}
        icon="cart"
      />
      {isAuthenticated && !isAdmin ? (
        <Drawer.Item
          label="My Orders"
          onPress={navigateToMyOrders}
          icon="receipt"
        />
      ) : isAdmin ? (
        <Drawer.Item
          label="Admin"
          onPress={navigateToAdmin}
          icon="shield-account"
        />
      ) : null}
      <Drawer.Item
        label={profileLabel}
        onPress={navigateToProfile}
        icon={isAuthenticated ? 'account' : 'login'}
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
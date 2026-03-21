import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import AuthGlobal from '../Context/Store/AuthGlobal';
import Toast from 'react-native-toast-message';
import { logoutUser } from '../Context/Actions/Auth.actions';

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

  const handleLogout = () => {
    navigation.closeDrawer();
    logoutUser(context.dispatch);
    setTimeout(() => {
      navigation.navigate('Zone Runners', {
        screen: 'User',
        params: { screen: 'Login' },
      });
    }, 140);
  };

  const Item = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.85} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandName}>ZONE RUNNERS</Text>
        <Text style={styles.brandTag}>LIGHT SPORTS CATALOG</Text>
      </View>
      <View style={styles.menuBlock}>
      <Item label="Home" onPress={navigateToHome} icon="home-outline" />
      <Item label="Cart" onPress={navigateToCart} icon="cart-outline" />
      {isAuthenticated && !isAdmin ? (
        <Item label="My Orders" onPress={navigateToMyOrders} icon="receipt-text-outline" />
      ) : isAdmin ? (
        <Item label="Admin" onPress={navigateToAdmin} icon="shield-account-outline" />
      ) : null}
      <Item label={profileLabel} onPress={navigateToProfile} icon={isAuthenticated ? 'account-outline' : 'login'} />
      </View>
      {isAuthenticated ? (
        <View style={styles.footerBlock}>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 56,
  },
  brandBlock: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  brandTag: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
  },
  menuBlock: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  item: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },
  itemText: {
    color: colors.text,
    fontWeight: '700',
  },
  footerBlock: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutButton: {
    minHeight: 46,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default DrawerContent;
import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useSelector } from 'react-redux';

import Main from "./Main";
import DrawerContent from "../Shared/DrawerContent";
import { colors, spacing } from "../Shared/theme";

const NativeDrawer = createDrawerNavigator();

const getFocusedRouteName = (route) => {
  const state = route?.state;
  if (!state || !Array.isArray(state.routes) || state.routes.length === 0) {
    return route?.name;
  }

  const focused = state.routes[state.index ?? 0];
  if (!focused) {
    return route?.name;
  }

  return getFocusedRouteName(focused);
};

const DrawerNavigator = () => {
  const cartItems = useSelector((state) => state.cartItems || []);
  const cartCount = cartItems.length;

  return (
    <NativeDrawer.Navigator
      screenOptions={({ navigation, route }) => ({
        drawerStyle: {
          width: '76%',
          backgroundColor: colors.surface,
          borderRightWidth: 1,
          borderRightColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: () => null,
        headerShadowVisible: true,
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
        headerLeft: () => (
          <TouchableOpacity style={styles.leftHeader} activeOpacity={0.85} onPress={() => navigation.openDrawer()}>
            <MaterialCommunityIcons name="menu" size={26} color={colors.primary} />
            <View>
              <Text style={styles.headerTitle}>ZONE RUNNERS</Text>
              <Text style={styles.headerSubtitle}>SPORTS STORE</Text>
            </View>
          </TouchableOpacity>
        ),
        headerRight: () => {
          const focusedRouteName = getFocusedRouteName(route);
          const shouldShowHomeCart = focusedRouteName === 'Main' || focusedRouteName === 'Home';

          if (!shouldShowHomeCart) {
            return null;
          }

          return (
            <TouchableOpacity
              style={styles.cartButton}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Zone Runners', {
                  screen: 'Cart Screen',
                  params: { screen: 'Cart' },
                })
              }
            >
              <MaterialCommunityIcons name="cart-outline" size={24} color={colors.primary} />
              <Text style={styles.cartCount}>{cartCount}</Text>
            </TouchableOpacity>
          );
        },
      })}
      drawerContent={(props) => <DrawerContent {...props} />}>
      <NativeDrawer.Screen name="Zone Runners" component={Main} options={{ title: '' }} />
    </NativeDrawer.Navigator>
  );
}

const styles = StyleSheet.create({
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  cartButton: {
    marginRight: spacing.md,
    minWidth: 54,
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cartCount: {
    color: colors.primary,
    fontWeight: '800',
    minWidth: 12,
    textAlign: 'center',
  },
});

export default DrawerNavigator
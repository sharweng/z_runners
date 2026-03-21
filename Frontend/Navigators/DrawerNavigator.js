import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

import Main from "./Main";
import DrawerContent from "../Shared/DrawerContent";
import { colors, spacing } from "../Shared/theme";

const NativeDrawer = createDrawerNavigator();
const DrawerNavigator = () => {
  return (
    <NativeDrawer.Navigator
      screenOptions={({ navigation }) => ({
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
          return null;
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
});

export default DrawerNavigator
import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createDrawerNavigator,

} from "@react-navigation/drawer";

import Main from "./Main";

import DrawerContent from "../Shared/DrawerContent";
import { colors } from "../Shared/theme";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NativeDrawer = createDrawerNavigator();
const DrawerNavigator = () => {
  const navigation = useNavigation();

  const openSearch = () => {
    navigation.navigate('Zone Runners', {
      screen: 'Home',
      params: {
        screen: 'Main',
        params: { openSearch: true },
      },
    });
  };

  return (

    <NativeDrawer.Navigator
      screenOptions={{
        drawerStyle: {
          width: '72%',
          backgroundColor: colors.surface,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitle: () => null,
        headerShadowVisible: false,
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
        headerLeft: () => (
          <TouchableOpacity style={styles.leftHeader} activeOpacity={0.85} onPress={() => navigation.openDrawer()}>
            <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
            <Text style={styles.headerTitle}>Zone Runners</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={openSearch} style={styles.searchButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="magnify" size={26} color={colors.text} />
          </TouchableOpacity>
        ),
      }}

      drawerContent={(props) => <DrawerContent {...props} />}>
      <NativeDrawer.Screen name="Zone Runners" component={Main} options={{ title: '' }} />

    </NativeDrawer.Navigator>


  );
}

const styles = StyleSheet.create({
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});

export default DrawerNavigator
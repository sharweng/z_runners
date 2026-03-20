import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createDrawerNavigator,

} from "@react-navigation/drawer";

import Main from "./Main";

import DrawerContent from "../Shared/DrawerContent";
import { colors } from "../Shared/theme";
import { TouchableOpacity, Text, StyleSheet, View, TextInput } from "react-native";

const NativeDrawer = createDrawerNavigator();
const DrawerNavigator = () => {
  const [isHeaderSearchActive, setIsHeaderSearchActive] = React.useState(false);
  const [headerSearchText, setHeaderSearchText] = React.useState("");

  const pushSearchParamsToHome = React.useCallback((navigation, text = "", openSearch = false) => {
    navigation.navigate('Zone Runners', {
      screen: 'Home',
      params: {
        screen: 'Main',
        params: {
          openSearch,
          headerSearchText: text,
        },
      },
    });
  }, []);

  return (

    <NativeDrawer.Navigator
      screenOptions={({ navigation }) => ({
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
        headerLeft: () => {
          if (isHeaderSearchActive) {
            return (
              <View style={styles.searchHeaderWrap}>
                <TouchableOpacity
                  style={styles.searchBackButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setIsHeaderSearchActive(false);
                    setHeaderSearchText("");
                    pushSearchParamsToHome(navigation, "", false);
                  }}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  value={headerSearchText}
                  onChangeText={(text) => {
                    setHeaderSearchText(text);
                    pushSearchParamsToHome(navigation, text, true);
                  }}
                  placeholder="Search products"
                  placeholderTextColor={colors.muted}
                  style={styles.searchInput}
                  autoFocus
                />
              </View>
            );
          }

          return (
            <TouchableOpacity style={styles.leftHeader} activeOpacity={0.85} onPress={() => navigation.openDrawer()}>
              <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
              <Text style={styles.headerTitle}>Zone Runners</Text>
            </TouchableOpacity>
          );
        },
        headerRight: () => {
          if (isHeaderSearchActive) {
            return (
              <TouchableOpacity
                onPress={() => {
                  if (headerSearchText) {
                    setHeaderSearchText("");
                    pushSearchParamsToHome(navigation, "", true);
                    return;
                  }

                  setIsHeaderSearchActive(false);
                  pushSearchParamsToHome(navigation, "", false);
                }}
                style={styles.searchButton}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name={headerSearchText ? "close" : "magnify"} size={24} color={colors.text} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              onPress={() => {
                setIsHeaderSearchActive(true);
                pushSearchParamsToHome(navigation, headerSearchText, true);
              }}
              style={styles.searchButton}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="magnify" size={26} color={colors.text} />
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
  searchHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    width: '92%',
  },
  searchBackButton: {
    padding: 6,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: 10,
  },
});

export default DrawerNavigator
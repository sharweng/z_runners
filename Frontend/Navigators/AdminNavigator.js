import React, { useContext } from "react"
import { View, Text } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Orders from "../Screens/Admin/Orders"
import Products from "../Screens/Admin/Products"
import ProductForm from "../Screens/Admin/ProductForm"
import Categories from "../Screens/Admin/Categories"
import AuthGlobal from "../Context/Store/AuthGlobal"
import { colors } from "../Shared/theme"

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const AdminTabs = () => {
    return (
        <Tab.Navigator
            swipeEnabled={false}
            screenOptions={{
                swipeEnabled: false,
                tabBarStyle: { backgroundColor: colors.surface },
                tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
                tabBarLabelStyle: { color: colors.text, fontWeight: '700' },
            }}
        >
            <Tab.Screen name="Products" component={Products} />
            <Tab.Screen name="Orders" component={Orders} />
            <Tab.Screen name="Categories" component={Categories} />
        </Tab.Navigator>
    );
};

const AdminNavigator = () => {
    const context = useContext(AuthGlobal);
    const isAdmin = !!context?.stateUser?.user?.isAdmin;

    if (!isAdmin) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Admin access required.</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AdminTabs"
                component={AdminTabs}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="ProductForm"
                component={ProductForm}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}
export default AdminNavigator
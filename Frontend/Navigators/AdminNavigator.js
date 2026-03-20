import React, { useContext } from "react"
import { View, Text } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"

import Orders from "../Screens/Admin/Orders"
import Products from "../Screens/Admin/Products"
import ProductForm from "../Screens/Admin/ProductForm"
import Categories from "../Screens/Admin/Categories"
import AuthGlobal from "../Context/Store/AuthGlobal"
import { colors } from "../Shared/theme"

const Stack = createStackNavigator();

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
                name="Products"
                component={Products}
                options={{
                    title: "Products",
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                }}
            />
            <Stack.Screen name="Categories" component={Categories} options={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
            <Stack.Screen name="Orders" component={Orders} options={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
            <Stack.Screen name="ProductForm" component={ProductForm} options={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
        </Stack.Navigator>
    )
}
export default AdminNavigator
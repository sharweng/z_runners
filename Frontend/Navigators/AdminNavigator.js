import React from "react"
import { createStackNavigator } from "@react-navigation/stack"

import Orders from "../Screens/Admin/Orders"
import Products from "../Screens/Admin/Products"
import ProductForm from "../Screens/Admin/ProductForm"
import Categories from "../Screens/Admin/Categories"
import { colors } from "../Shared/theme"

const Stack = createStackNavigator();

const AdminNavigator = () => {

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
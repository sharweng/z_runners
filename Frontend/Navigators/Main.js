import React, { useContext } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import HomeNavigator from "./HomeNavigator";
import CartNavigator from "./CartNavigator";
import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";
import MyOrdersNavigator from "./MyOrdersNavigator";
import AuthGlobal from "../Context/Store/AuthGlobal";

const Tab = createMaterialTopTabNavigator();

const Main = () => {
    const context = useContext(AuthGlobal);
    const isAdmin = !!context?.stateUser?.user?.isAdmin;

    return (
        <Tab.Navigator
            initialRouteName="Home"
            tabBar={() => null}
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
                lazy: true,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{
                    headerShown: false,
                }}
            />

            <Tab.Screen
                name="Cart Screen"
                component={CartNavigator}
                options={{
                    headerShown: false,
                }}
            />

            {!isAdmin && (
                <Tab.Screen
                    name="My Orders"
                    component={MyOrdersNavigator}
                    options={{
                        headerShown: false,
                    }}
                />
            )}

            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminNavigator}
                    options={{
                        headerShown: false,
                    }}
                />
            )}
            <Tab.Screen
                name="User"
                component={UserNavigator}
                options={{
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    )
}
export default Main
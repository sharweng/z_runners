import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
import HomeNavigator from "./HomeNavigator";
import { Ionicons } from "@expo/vector-icons";
import CartNavigator from "./CartNavigator";
import CartIcon from "../Shared/CartIcon";
import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";
const Tab = createBottomTabNavigator();

const Main = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#e91e63'
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => {
                        return <Ionicons
                            name="home"
                            style={{ position: "relative" }}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />

            <Tab.Screen
                name="Cart Screen"
                component={CartNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => {
                        return <>
                            <Ionicons
                                name="cart"
                                style={{ position: "relative" }}
                                color={color}
                                size={30}

                            />
                            <CartIcon />
                        </>
                    }
                }}
            />

            <Tab.Screen
                name="Admin"
                component={AdminNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => {
                        return <Ionicons
                            name="cog"
                            style={{ position: "relative" }}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />
            <Tab.Screen
                name="User"
                component={UserNavigator}
                options={{
                    tabBarIcon: ({ color }) => {
                        return <Ionicons
                            name="person"
                            style={{ position: "relative" }}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />
        </Tab.Navigator>
    )
}
export default Main
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

// Screens
import Checkout from '../Screens/Checkout/Checkout';
import Payment from '../Screens/Checkout/Payment';
import Confirm from '../Screens/Checkout/Confirm';
import { colors } from '../Shared/theme';

const Tab = createMaterialTopTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.muted,
                tabBarIndicatorStyle: { backgroundColor: colors.accent },
                tabBarStyle: { backgroundColor: colors.surface },
            }}
        >
            <Tab.Screen name="Shipping" component={Checkout} />
            <Tab.Screen name="Payment" component={Payment} />
            <Tab.Screen name="Confirm" component={Confirm} />
        </Tab.Navigator>
    );
}

export default function CheckoutNavigator() {
    return <MyTabs />
}
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
            screenListeners={{
                tabPress: (e) => {
                    e.preventDefault();
                },
            }}
            screenOptions={{
                swipeEnabled: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.muted,
                tabBarIndicatorStyle: { backgroundColor: colors.accent, height: 3 },
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                },
                tabBarItemStyle: {
                    flex: 1,
                },
                tabBarLabelStyle: {
                    fontWeight: '800',
                    fontSize: 12,
                },
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
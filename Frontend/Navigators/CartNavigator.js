import React, { useContext } from 'react'
import { createStackNavigator } from "@react-navigation/stack"

import Cart from '../Screens/Cart/Cart';
import CheckoutNavigator from './CheckoutNavigator';
import AuthGlobal from '../Context/Store/AuthGlobal';

const Stack = createStackNavigator();

function MyStack() {
    const context = useContext(AuthGlobal);
    const isAuthenticated = !!context?.stateUser?.isAuthenticated;

    return(
        <Stack.Navigator>
            <Stack.Screen 
                name="Cart"
                component={Cart}
                options={{
                    headerShown: false
                }}
            />
            {isAuthenticated ? (
                <Stack.Screen 
                    name="Checkout"
                    component={CheckoutNavigator}
                    options={{
                        headerShown: false,
                    }}
                />
            ) : null}
        </Stack.Navigator>
    )
}

export default function CartNavigator() {
    return <MyStack />
}
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MyOrders from '../Screens/User/MyOrders';
import OrderDetails from '../Screens/User/OrderDetails';

const Stack = createStackNavigator();

const MyOrdersNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="My Orders List"
        component={MyOrders}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Order Details"
        component={OrderDetails}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MyOrdersNavigator;

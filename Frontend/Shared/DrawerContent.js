import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Drawer, } from 'react-native-paper';
import { Platform, Alert } from 'react-native';



const DrawerContent = () => {
  const [active, setActive] = useState('');

  const navigation = useNavigation();

  return (
    <Drawer.Section title="Drawer">
      <Drawer.Item
        label="My Profile"

        onPress={() => navigation.navigate('User', { screen: 'User Profile' })}
        icon="account"
      />
      <Drawer.Item
        label="My Orders"
        onPress={() => navigation.navigate('User', { screen: 'My Orders' })}
        icon="cart-variant"
      />
      <Drawer.Item
        label="Recents"
        active={active === 'Recents'}
        onPress={() => onClick('Recents')}
        icon="history"
      />
      <Drawer.Item
        label="Notifications"
        active={active === 'Notifications'}
        // onPress={sendPushNotificationHandler}
        icon="bell"
      />

    </Drawer.Section>
  );
};

export default DrawerContent;
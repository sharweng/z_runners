import React, { useEffect, useState } from 'react';
if (!global.setImmediate) {
  global.setImmediate = setTimeout;
}
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native'
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './Redux/store';
import Toast from 'react-native-toast-message';
import Auth from './Context/Store/Auth';
import DrawerNavigator from './Navigators/DrawerNavigator';
import { colors } from './Shared/theme';
import { setCartItems } from './Redux/Actions/cartActions';
import {
  getSavedCartItems,
  initCartTable,
  replaceSavedCartItems,
} from './Screens/Cart/cartStorage';

const CartPersistence = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapCart = async () => {
      try {
        await initCartTable();
        const savedItems = await getSavedCartItems();
        if (isMounted && savedItems.length > 0) {
          dispatch(setCartItems(savedItems));
        }
      } catch (error) {
        console.log('Failed to hydrate cart from SQLite', error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    bootstrapCart();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    replaceSavedCartItems(cartItems).catch((error) => {
      console.log('Failed to persist cart to SQLite', error);
    });
  }, [cartItems, isHydrated]);

  return null;
};

export default function App() {
  return (
    <Auth>
      <Provider store={store}>
        <CartPersistence />
        <NavigationContainer>
          <PaperProvider>
            <StatusBar style="dark" backgroundColor={colors.background} />
            <DrawerNavigator />
          </PaperProvider>
        </NavigationContainer>
        <Toast />
      </Provider>
    </Auth>

  );
}

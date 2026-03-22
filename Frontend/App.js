import React, { useContext, useEffect, useState } from 'react';
if (!global.setImmediate) {
  global.setImmediate = setTimeout;
}
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native'
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './Redux/store';
import Toast from 'react-native-toast-message';
import Auth from './Context/Store/Auth';
import AuthGlobal from './Context/Store/AuthGlobal';
import DrawerNavigator from './Navigators/DrawerNavigator';
import { colors } from './Shared/theme';
import { setCartItems } from './Redux/Actions/cartActions';
import {
  getSavedCartItems,
  initCartTable,
  replaceSavedCartItems,
} from './Screens/Cart/cartStorage';
import { navigationRef, navigateToOrderDetails, flushPendingOrderNavigation } from './utils/navigation';
import {
  getDiscountAlertFromNotificationResponse,
  getOrderIdFromNotificationResponse,
  registerPushTokenForUser,
} from './utils/pushNotifications';

const NOTIFICATION_ALERT_SEEN_PREFIX = 'notif_seen_discount_alert_';

const isPushNotifEnabled = ['1', 'true', 'yes', 'on'].includes(
  String(process.env.EXPO_PUBLIC_PUSH_NOTIF ?? process.env.push_notif ?? 'false').trim().toLowerCase()
) && Constants?.appOwnership !== 'expo';

if (isPushNotifEnabled) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const CartPersistence = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems);
  const context = useContext(AuthGlobal);
  const [hydratedOwnerKey, setHydratedOwnerKey] = useState('');

  const userId = context?.stateUser?.user?.userId;
  const cartOwnerKey = userId ? `user:${userId}` : 'guest';

  useEffect(() => {
    let isMounted = true;

    const bootstrapCart = async () => {
      try {
        await initCartTable();
        const savedItems = await getSavedCartItems(cartOwnerKey);
        if (isMounted) {
          dispatch(setCartItems(savedItems));
          setHydratedOwnerKey(cartOwnerKey);
        }
      } catch (error) {
        console.log('Failed to hydrate cart from SQLite', error);
        if (isMounted) {
          dispatch(setCartItems([]));
          setHydratedOwnerKey(cartOwnerKey);
        }
      }
    };

    bootstrapCart();

    return () => {
      isMounted = false;
    };
  }, [cartOwnerKey, dispatch]);

  useEffect(() => {
    if (hydratedOwnerKey !== cartOwnerKey) {
      return;
    }

    replaceSavedCartItems(cartOwnerKey, cartItems).catch((error) => {
      console.log('Failed to persist cart to SQLite', error);
    });
  }, [cartItems, cartOwnerKey, hydratedOwnerKey]);

  return null;
};

const NotificationBootstrap = () => {
  const context = useContext(AuthGlobal);
  const userId = context?.stateUser?.user?.userId;
  const isAuthenticated = !!context?.stateUser?.isAuthenticated;
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [activeDiscountAlert, setActiveDiscountAlert] = useState(null);

  const maybeShowDiscountAlertPopup = async (payload) => {
    if (!payload?.alertId) {
      return;
    }

    const storageKey = `${NOTIFICATION_ALERT_SEEN_PREFIX}${payload.alertId}`;

    try {
      const seen = await AsyncStorage.getItem(storageKey);
      if (seen === '1') {
        return;
      }

      await AsyncStorage.setItem(storageKey, '1');
      setActiveDiscountAlert(payload);
    } catch (error) {
      setActiveDiscountAlert(payload);
    }
  };

  useEffect(() => {
    if (!isPushNotifEnabled) {
      return;
    }

    if (!isAuthenticated || !userId) {
      return;
    }

    registerPushTokenForUser(userId);
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (!isAuthenticated || !pendingOrderId) {
      return;
    }

    navigateToOrderDetails(pendingOrderId);
    setPendingOrderId(null);
  }, [isAuthenticated, pendingOrderId]);

  useEffect(() => {
    if (!isPushNotifEnabled) {
      return;
    }

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const discountAlert = getDiscountAlertFromNotificationResponse(response);
      if (discountAlert) {
        maybeShowDiscountAlertPopup(discountAlert);
      }

      const orderId = getOrderIdFromNotificationResponse(response);
      if (!orderId) {
        return;
      }

      if (!isAuthenticated) {
        setPendingOrderId(orderId);
        navigationRef.navigate('Zone Runners', {
          screen: 'User',
          params: { screen: 'Login' },
        });
        return;
      }

      navigateToOrderDetails(orderId);
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        const discountAlert = getDiscountAlertFromNotificationResponse(response);
        if (discountAlert) {
          maybeShowDiscountAlertPopup(discountAlert);
        }

        const orderId = getOrderIdFromNotificationResponse(response);
        if (orderId) {
          if (!isAuthenticated) {
            setPendingOrderId(orderId);
            navigationRef.navigate('Zone Runners', {
              screen: 'User',
              params: { screen: 'Login' },
            });
            return;
          }

          navigateToOrderDetails(orderId);
        }
      })
      .catch(() => {
        // Best-effort deep link restore for notification opens.
      });

    return () => {
      responseSubscription.remove();
    };
  }, [isAuthenticated]);

  return (
    <Modal
      visible={!!activeDiscountAlert}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveDiscountAlert(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{activeDiscountAlert?.title || 'Discount Alert'}</Text>
          <Text style={styles.modalBody}>{activeDiscountAlert?.body || activeDiscountAlert?.details || 'Check out the latest discount in the app.'}</Text>
          {activeDiscountAlert?.code ? (
            <Text style={styles.modalMeta}>Code: {activeDiscountAlert.code}</Text>
          ) : null}
          {activeDiscountAlert?.minOrderAmount > 0 ? (
            <Text style={styles.modalMeta}>Minimum order: PHP {Number(activeDiscountAlert.minOrderAmount).toFixed(2)}</Text>
          ) : null}
          {activeDiscountAlert?.expiresAt ? (
            <Text style={styles.modalMeta}>Ends: {new Date(activeDiscountAlert.expiresAt).toLocaleDateString()}</Text>
          ) : null}

          <Pressable style={styles.modalButton} onPress={() => setActiveDiscountAlert(null)}>
            <Text style={styles.modalButtonText}>CLOSE</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default function App() {
  return (
    <Auth>
      <Provider store={store}>
        <CartPersistence />
        <NavigationContainer
          ref={navigationRef}
          onReady={flushPendingOrderNavigation}
        >
          <PaperProvider>
            <StatusBar style="dark" backgroundColor={colors.background} />
            {isPushNotifEnabled ? <NotificationBootstrap /> : null}
            <DrawerNavigator />
          </PaperProvider>
        </NavigationContainer>
        <Toast />
      </Provider>
    </Auth>

  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 30, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  modalTitle: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 20,
    marginBottom: 10,
  },
  modalBody: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalMeta: {
    color: colors.muted,
    marginBottom: 4,
    fontWeight: '600',
  },
  modalButton: {
    marginTop: 12,
    minHeight: 46,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: colors.surface,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

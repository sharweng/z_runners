import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';

import baseURL from '../constants/baseurl';
import { getJwtToken } from './tokenStorage';

const isPushNotifEnabled = ['1', 'true', 'yes', 'on'].includes(
  String(process.env.EXPO_PUBLIC_PUSH_NOTIF ?? process.env.push_notif ?? 'false').trim().toLowerCase()
) && Constants?.appOwnership !== 'expo';

const getProjectId = () => {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId
    || Constants?.easConfig?.projectId
    || null
  );
};

export const configureNotificationChannel = async () => {
  if (!isPushNotifEnabled) {
    return;
  }

  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0C4DA2',
  });
};

export const registerPushTokenForUser = async (userId) => {
  if (!isPushNotifEnabled) {
    return null;
  }

  if (!userId || !Device.isDevice) {
    return null;
  }

  try {
    await configureNotificationChannel();

    let { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      const permissionResult = await Notifications.requestPermissionsAsync();
      status = permissionResult.status;
    }

    if (status !== 'granted') {
      return null;
    }

    const projectId = getProjectId();
    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const expoPushToken = tokenResponse?.data || null;
    if (!expoPushToken) {
      return null;
    }

    const jwtToken = await getJwtToken();
    if (!jwtToken) {
      return expoPushToken;
    }

    await axios.put(
      `${baseURL}users/${userId}/push-token`,
      { expoPushToken },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    return expoPushToken;
  } catch (error) {
    console.log('Push token registration failed', error?.message || error);
    return null;
  }
};

export const getOrderIdFromNotificationResponse = (response) => {
  const data = response?.notification?.request?.content?.data || {};
  const orderId = String(data?.orderId || data?.orderID || data?.id || '').trim();
  return orderId || null;
};

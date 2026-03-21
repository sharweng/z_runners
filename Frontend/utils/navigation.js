import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingOrderId = null;

const navigateInternal = (orderId) => {
  navigationRef.navigate('Zone Runners', {
    screen: 'My Orders',
    params: {
      screen: 'Order Details',
      params: {
        order: {
          id: orderId,
          _id: orderId,
        },
      },
    },
  });
};

export const navigateToOrderDetails = (orderId) => {
  const normalizedOrderId = String(orderId || '').trim();
  if (!normalizedOrderId) {
    return false;
  }

  if (!navigationRef.isReady()) {
    pendingOrderId = normalizedOrderId;
    return false;
  }

  navigateInternal(normalizedOrderId);
  return true;
};

export const flushPendingOrderNavigation = () => {
  if (!pendingOrderId || !navigationRef.isReady()) {
    return;
  }

  const targetOrderId = pendingOrderId;
  pendingOrderId = null;
  navigateInternal(targetOrderId);
};

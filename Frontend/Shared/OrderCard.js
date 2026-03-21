import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import TrafficLight from "./StyledComponents/TrafficLight";
import EasyButton from "./StyledComponents/EasyButton";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

import { colors, spacing } from "./theme";
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../Redux/Actions/orderActions';
import { getJwtToken } from "../utils/tokenStorage";

const adminCodes = [
  { name: "pending", code: "pending" },
  { name: "shipped", code: "shipped" },
  { name: "cancelled", code: "cancelled" },
];

const normalizeStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();

  if (value === '3' || value === 'ongoing') {
    return 'pending';
  }

  if (value === '2') {
    return 'shipped';
  }

  if (value === '1') {
    return 'delivered';
  }

  if (value === 'canceled') {
    return 'cancelled';
  }

  return value || 'pending';
};

const getFormattedDate = (dateRaw) => {
  if (!dateRaw) {
    return "N/A";
  }

  const parsed = new Date(dateRaw);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleDateString();
};

const getItemCount = (orderItems) => {
  if (!Array.isArray(orderItems)) {
    return 0;
  }

  return orderItems.reduce((count, current) => count + (Number(current?.quantity) || 0), 0);
};

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  return amount.toFixed(2);
};

const OrderCard = ({
  item,
  update,
  compact = false,
  onCancelOrder,
  onMarkDelivered,
  onPressCard,
  onStatusUpdated,
  actionLoading = false,
}) => {
  const normalizedStatus = normalizeStatus(item.status);
  const isOrderLocked = item?.isLocked || normalizedStatus === 'delivered' || normalizedStatus === 'cancelled';
  const [statusChange, setStatusChange] = useState(normalizedStatus || 'pending');
  const itemCount = getItemCount(item.orderItems);

  useEffect(() => {
    setStatusChange(normalizedStatus || 'pending');
  }, [normalizedStatus, item?.id]);

  const statusMeta = useMemo(() => {
    if (normalizedStatus === 'pending') {
      return {
        label: 'pending',
        cardColor: '#E74C3C',
        light: <TrafficLight unavailable></TrafficLight>,
      };
    }

    if (normalizedStatus === 'shipped') {
      return {
        label: 'shipped',
        cardColor: '#F1C40F',
        light: <TrafficLight limited></TrafficLight>,
      };
    }

    if (normalizedStatus === 'cancelled') {
      return {
        label: 'cancelled',
        cardColor: '#95A5A6',
        light: <TrafficLight unavailable></TrafficLight>,
      };
    }

    return {
      label: 'delivered',
      cardColor: '#2ECC71',
      light: <TrafficLight available></TrafficLight>,
    };
  }, [normalizedStatus]);

  const dispatch = useDispatch();

  const updateOrder = async () => {
    if (isOrderLocked) {
      Toast.show({
        topOffset: 60,
        type: "error",
        text1: "Order Locked",
        text2: "Delivered or cancelled orders cannot be updated.",
      });
      return;
    }

    try {
      const token = await getJwtToken();
      const updatedOrder = await dispatch(updateOrderStatus(item.id, statusChange, token));
      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated(updatedOrder);
      }
          Toast.show({
            topOffset: 60,
            type: "success",
            text1: "Order Updated",
            text2: "",
          });
    } catch (error) {
      const message = error?.message || 'Please try again';
      Toast.show({
        topOffset: 60,
        type: "error",
        text1: "Something went wrong",
        text2: message,
      });
    }
  }
  const content = (
    <View style={[styles.container, compact ? styles.compactContainer : null, { borderColor: statusMeta.cardColor }]}> 
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{item.id}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{statusMeta.label}</Text>
          {statusMeta.light}
        </View>
      </View>
      <View style={styles.body}>
        {compact ? (
          <>
            <Text style={styles.meta}>Date Ordered: {getFormattedDate(item.dateOrdered)}</Text>
            <Text style={styles.meta}>Items: {itemCount}</Text>
          </>
        ) : (
          <>
            <Text style={styles.meta}>Address: {item.shippingAddress1} {item.shippingAddress2}</Text>
            <Text style={styles.meta}>City: {item.city}</Text>
            <Text style={styles.meta}>Country: {item.country}</Text>
            <Text style={styles.meta}>Date Ordered: {getFormattedDate(item.dateOrdered)}</Text>
          </>
        )}
        <View style={styles.priceContainer}>
          <Text style={styles.meta}>Price</Text>
          <Text style={styles.price}>$ {formatMoney(item.totalPrice)}</Text>
        </View>
        {!update ? (
          <View style={styles.userActionsWrap}>
            {normalizedStatus === 'pending' && onCancelOrder ? (
              <EasyButton
                danger
                large
                style={styles.fullWidthAction}
                onPress={onCancelOrder}
                disabled={actionLoading}
              >
                <Text style={styles.actionText}>Cancel Order</Text>
              </EasyButton>
            ) : null}
            {normalizedStatus === 'shipped' && onMarkDelivered ? (
              <EasyButton
                secondary
                large
                style={styles.fullWidthAction}
                onPress={onMarkDelivered}
                disabled={actionLoading}
              >
                <Text style={styles.actionText}>Mark Delivered</Text>
              </EasyButton>
            ) : null}
          </View>
        ) : null}
        {update ? <View>
          <>
            {isOrderLocked ? (
              <Text style={styles.lockedOrderText}>
                {normalizedStatus === 'cancelled' ? 'Order Cancelled' : 'Order Delivered'}
              </Text>
            ) : (
              <>
                <Picker
                  style={styles.picker}
                  selectedValue={statusChange}
                  dropdownIconColor={colors.primary}
                  onValueChange={(e) => setStatusChange(e)}
                >
                  {adminCodes.map((c) => {
                    return <Picker.Item
                      key={c.code}
                      label={c.name}
                      value={c.code}
                    />
                  })}
                </Picker>
                <EasyButton
                  secondary
                  large
                  style={styles.actionButton}
                  onPress={() => updateOrder()}
                >
                  <Text style={{ color: "white" }}>Update</Text>
                </EasyButton>
              </>
            )}
          </>
        </View> : null}


      </View>
    </View>
  );

  if (!update && typeof onPressCard === 'function') {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPressCard}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  compactContainer: {
    padding: spacing.md,
    margin: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 13,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    textTransform: 'capitalize',
    color: colors.text,
    fontWeight: '700',
  },
  body: {
    gap: spacing.xs,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  priceContainer: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: 'space-between',
  },
  price: {
    color: colors.primary,
    fontWeight: "bold",
  },
  picker: {
    backgroundColor: colors.surfaceSoft,
    marginTop: spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  userActionsWrap: {
    marginTop: spacing.sm,
    marginHorizontal: 0,
  },
  fullWidthAction: {
    width: '100%',
    marginHorizontal: 0,
    marginVertical: 0,
    minHeight: 38,
  },
  actionText: {
    color: 'white',
    fontWeight: '700',
  },
  lockedOrderText: {
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
});

export default OrderCard;
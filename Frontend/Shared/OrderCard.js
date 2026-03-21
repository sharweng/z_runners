import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import TrafficLight from "./StyledComponents/TrafficLight";
import EasyButton from "./StyledComponents/EasyButton";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { colors, radius, shadow, spacing } from "./theme";
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../Redux/Actions/orderActions';

const adminCodes = [
  { name: "pending", code: "pending" },
  { name: "shipped", code: "shipped" },
  { name: "cancelled", code: "cancelled" },
];

const normalizeStatus = (status) => {
  if (status === '3' || status === 'ongoing') {
    return 'pending';
  }

  if (status === '2') {
    return 'shipped';
  }

  if (status === '1') {
    return 'delivered';
  }

  if (status === 'canceled') {
    return 'cancelled';
  }

  return status;
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

const OrderCard = ({
  item,
  update,
  compact = false,
  onViewDetails,
  onCancelOrder,
  onMarkDelivered,
  actionLoading = false,
}) => {
  const normalizedStatus = normalizeStatus(item.status);
  const [statusChange, setStatusChange] = useState(normalizedStatus || 'pending');
  const itemCount = getItemCount(item.orderItems);

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

  const navigation = useNavigation()
  const dispatch = useDispatch();

  const updateOrder = () => {
    AsyncStorage.getItem("jwt")
      .then((token) => {
        return dispatch(updateOrderStatus(item.id, statusChange, token));
      })
      .then(() => {
          Toast.show({
            topOffset: 60,
            type: "success",
            text1: "Order Updated",
            text2: "",
          });
          setTimeout(() => {
            navigation.navigate("Products");
          }, 500);
      })
      .catch((error) => {
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "Something went wrong",
          text2: "Please try again",
        });
      });
  }
  return (
    <View style={[styles.container, { borderColor: statusMeta.cardColor }]}> 
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
          <Text style={styles.price}>$ {item.totalPrice}</Text>
        </View>
        {!update ? (
          <View style={styles.userActionsWrap}>
            {normalizedStatus === 'pending' && onCancelOrder ? (
              <EasyButton
                danger
                medium
                onPress={onCancelOrder}
                disabled={actionLoading}
              >
                <Text style={styles.actionText}>Cancel Order</Text>
              </EasyButton>
            ) : null}
            {normalizedStatus === 'shipped' && onMarkDelivered ? (
              <EasyButton
                secondary
                medium
                onPress={onMarkDelivered}
                disabled={actionLoading}
              >
                <Text style={styles.actionText}>Mark Delivered</Text>
              </EasyButton>
            ) : null}
            {onViewDetails ? (
              <EasyButton
                primary
                medium
                onPress={onViewDetails}
              >
                <Text style={styles.actionText}>View Details</Text>
              </EasyButton>
            ) : null}
          </View>
        ) : null}
        {update ? <View>
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
        </View> : null}


      </View>
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontWeight: '800',
    color: colors.text,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    marginHorizontal: -6,
  },
  actionText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default OrderCard;
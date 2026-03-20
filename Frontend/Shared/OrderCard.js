import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TrafficLight from "./StyledComponents/TrafficLight";
import EasyButton from "./StyledComponents/EasyButton";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { colors, radius, shadow, spacing } from "./theme";
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../Redux/Actions/orderActions';

const codes = [
  { name: "pending", code: "pending" },
  { name: "shipped", code: "shipped" },
  { name: "delivered", code: "delivered" },
];
const OrderCard = ({ item, update }) => {
  console.log(item)
  const [orderStatus, setOrderStatus] = useState('');
  const [statusText, setStatusText] = useState('');
  const [statusChange, setStatusChange] = useState(item.status === "ongoing" ? "pending" : item.status);
  const [cardColor, setCardColor] = useState('');

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
  useEffect(() => {
    if (item.status == "3" || item.status === "pending" || item.status === "ongoing") {
      setOrderStatus(<TrafficLight unavailable></TrafficLight>);
      setStatusText("pending");
      setCardColor("#E74C3C");
    } else if (item.status == "2" || item.status === "shipped") {
      setOrderStatus(<TrafficLight limited></TrafficLight>);
      setStatusText("shipped");
      setCardColor("#F1C40F");
    } else {
      setOrderStatus(<TrafficLight available></TrafficLight>);
      setStatusText("delivered");
      setCardColor("#2ECC71");
    }

    return () => {
      setOrderStatus();
      setStatusText();
      setCardColor();
    };
  }, []);

  return (

    <View style={[styles.container, { borderColor: cardColor }]}> 
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{item.id}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{statusText}</Text>
          {orderStatus}
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.meta}>Address: {item.shippingAddress1} {item.shippingAddress2}</Text>
        <Text style={styles.meta}>City: {item.city}</Text>
        <Text style={styles.meta}>Country: {item.country}</Text>
        <Text style={styles.meta}>Date Ordered: {item.dateOrdered.split("T")[0]}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.meta}>Price</Text>
          <Text style={styles.price}>$ {item.totalPrice}</Text>
        </View>
        {update ? <View>
          <>
            <Picker
              style={styles.picker}
              selectedValue={statusChange}
              dropdownIconColor={colors.primary}
              onValueChange={(e) => setStatusChange(e)}
            >
              {codes.map((c) => {
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
});

export default OrderCard;
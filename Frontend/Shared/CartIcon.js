import React from "react";
import { StyleSheet } from "react-native";

import { useSelector, } from 'react-redux'
import { Badge, Text } from 'react-native-paper';
import { colors } from "./theme";



const CartIcon = (props) => {
  const cartItems = useSelector(state => state.cartItems)
  return (
    <>
      {cartItems.length ? (
        <Badge style={styles.badge}>
          <Text style={styles.text}>{cartItems.length}</Text>
        </Badge>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    position: "absolute",
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    top: -6,
    right: -10,
  },
  text: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white"

  },
})

export default CartIcon
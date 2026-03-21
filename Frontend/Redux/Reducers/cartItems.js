import {
    ADD_TO_CART,
    REMOVE_FROM_CART,
    CLEAR_CART,
    SET_CART_ITEMS,
    UPDATE_CART_QUANTITY,
} from '../constants';

const getProductId = (item) => item?.id || item?._id || item?.product;

const cartItems = (state = [], action) => {
    switch (action.type) {
        case ADD_TO_CART: {
            const incomingId = getProductId(action.payload);
            if (!incomingId) {
                return [...state, { ...action.payload, quantity: Number(action.payload?.quantity) || 1 }];
            }

            const existingItem = state.find((cartItem) => getProductId(cartItem) === incomingId);
            if (!existingItem) {
                return [...state, { ...action.payload, quantity: Number(action.payload?.quantity) || 1 }];
            }

            return state.map((cartItem) => {
                if (getProductId(cartItem) !== incomingId) {
                    return cartItem;
                }

                const currentQty = Number(cartItem?.quantity) || 1;
                return { ...cartItem, quantity: currentQty + (Number(action.payload?.quantity) || 1) };
            });
        }
        case REMOVE_FROM_CART: {
            const removeId = getProductId(action.payload);
            if (!removeId) {
                return state.filter(cartItem => cartItem !== action.payload);
            }
            return state.filter((cartItem) => getProductId(cartItem) !== removeId);
        }
        case CLEAR_CART:
            return state = []
        case SET_CART_ITEMS:
            return action.payload
        case UPDATE_CART_QUANTITY: {
            const { productId, quantity } = action.payload || {};
            const normalizedQty = Math.max(1, Number(quantity) || 1);

            return state.map((cartItem) => {
                if (getProductId(cartItem) !== productId) {
                    return cartItem;
                }

                return {
                    ...cartItem,
                    quantity: normalizedQty,
                };
            });
        }
    }
    return state;
}

export default cartItems;
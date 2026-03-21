import {
    ORDERS_REQUEST,
    ORDERS_SUCCESS,
    ORDERS_FAIL,
    ORDER_STATUS_UPDATE_REQUEST,
    ORDER_STATUS_UPDATE_SUCCESS,
    ORDER_STATUS_UPDATE_FAIL,
} from '../constants';

const initialState = {
    items: [],
    loading: false,
    updating: false,
    error: null,
};

const orders = (state = initialState, action) => {
    switch (action.type) {
        case ORDERS_REQUEST:
            return { ...state, loading: true, error: null };
        case ORDERS_SUCCESS:
            return { ...state, loading: false, items: action.payload };
        case ORDERS_FAIL:
            return { ...state, loading: false, error: action.payload };

        case ORDER_STATUS_UPDATE_REQUEST:
            return { ...state, updating: true, error: null };
        case ORDER_STATUS_UPDATE_SUCCESS:
            return {
                ...state,
                updating: false,
                items: state.items.map((order) => {
                    if (order.id !== action.payload.id) {
                        return order;
                    }

                    const nextOrderItems = Array.isArray(action.payload?.orderItems)
                        && action.payload.orderItems.length > 0
                        && typeof action.payload.orderItems[0] === 'object'
                        ? action.payload.orderItems
                        : order.orderItems;

                    return {
                        ...order,
                        ...action.payload,
                        orderItems: nextOrderItems,
                    };
                }),
            };
        case ORDER_STATUS_UPDATE_FAIL:
            return { ...state, updating: false, error: action.payload };

        default:
            return state;
    }
};

export default orders;

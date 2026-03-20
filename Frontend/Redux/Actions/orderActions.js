import axios from 'axios';
import baseURL from '../../constants/baseurl';
import {
    ORDERS_REQUEST,
    ORDERS_SUCCESS,
    ORDERS_FAIL,
    ORDER_STATUS_UPDATE_REQUEST,
    ORDER_STATUS_UPDATE_SUCCESS,
    ORDER_STATUS_UPDATE_FAIL,
} from '../constants';

export const fetchOrders = (token) => async (dispatch) => {
    dispatch({ type: ORDERS_REQUEST });
    try {
        const { data } = await axios.get(`${baseURL}orders`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: ORDERS_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: ORDERS_FAIL, payload: message });
        throw error;
    }
};

export const updateOrderStatus = (orderId, status, token) => async (dispatch) => {
    dispatch({ type: ORDER_STATUS_UPDATE_REQUEST });
    try {
        const { data } = await axios.put(
            `${baseURL}orders/${orderId}/status`,
            { status },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        dispatch({ type: ORDER_STATUS_UPDATE_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: ORDER_STATUS_UPDATE_FAIL, payload: message });
        throw error;
    }
};

import axios from 'axios';
import baseURL from '../../constants/baseurl';
import {
    ORDERS_REQUEST,
    ORDERS_SUCCESS,
    ORDERS_FAIL,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,
    CHECKOUT_QUOTE_REQUEST,
    CHECKOUT_QUOTE_SUCCESS,
    CHECKOUT_QUOTE_FAIL,
    ORDER_STATUS_UPDATE_REQUEST,
    ORDER_STATUS_UPDATE_SUCCESS,
    ORDER_STATUS_UPDATE_FAIL,
} from '../constants';

const getProductId = (item) => {
    if (!item) {
        return null;
    }

    const source = item.product ?? item.id ?? item._id;
    if (!source) {
        return null;
    }

    if (typeof source === 'string') {
        return source;
    }

    return source.id || source._id || null;
};

const normalizeOrderItemsPayload = (orderItems = []) => {
    if (!Array.isArray(orderItems)) {
        return [];
    }

    return orderItems
        .map((item) => ({
            product: getProductId(item),
            quantity: Math.max(1, Number(item?.quantity) || 1),
        }))
        .filter((item) => !!item.product);
};

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

export const fetchOrderById = (orderId, token) => async (dispatch) => {
    dispatch({ type: ORDER_DETAILS_REQUEST });
    try {
        const { data } = await axios.get(`${baseURL}orders/my-order/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: ORDER_DETAILS_FAIL, payload: message });
        throw error;
    }
};

export const updateOrderStatus = (orderId, status, token) => async (dispatch) => {
    dispatch({ type: ORDER_STATUS_UPDATE_REQUEST });
    if (!token) {
        const message = 'Session expired. Please login again.';
        dispatch({ type: ORDER_STATUS_UPDATE_FAIL, payload: message });
        throw new Error(message);
    }

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
        const responseMessage = error?.response?.data?.message || error?.response?.data;
        const message = error?.response?.status === 401
            ? 'Session expired or unauthorized. Please login again.'
            : (responseMessage || error.message);
        dispatch({ type: ORDER_STATUS_UPDATE_FAIL, payload: message });
        throw new Error(typeof message === 'string' ? message : 'Failed to update order status');
    }
};

export const fetchMyOrders = (userId, token) => async (dispatch) => {
    dispatch({ type: ORDERS_REQUEST });
    try {
        const { data } = await axios.get(`${baseURL}orders/my-orders/${userId}`, {
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

export const updateMyOrderStatus = (orderId, status, token) => async (dispatch) => {
    dispatch({ type: ORDER_STATUS_UPDATE_REQUEST });
    try {
        const { data } = await axios.put(
            `${baseURL}orders/${orderId}/my-status`,
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

export const createOrder = (orderPayload, token) => async (dispatch) => {
    dispatch({ type: ORDER_CREATE_REQUEST });
    try {
        const idempotencyKey = orderPayload?.idempotencyKey || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const normalizedPayload = {
            ...orderPayload,
            orderItems: normalizeOrderItemsPayload(orderPayload?.orderItems),
            idempotencyKey,
        };

        const { data } = await axios.post(`${baseURL}orders`, normalizedPayload, {
            timeout: 15000,
            headers: {
                Authorization: `Bearer ${token}`,
                'Idempotency-Key': idempotencyKey,
            },
        });

        dispatch({ type: ORDER_CREATE_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: ORDER_CREATE_FAIL, payload: message });
        throw error;
    }
};

export const fetchCheckoutQuote = (payload, token) => async (dispatch) => {
    dispatch({ type: CHECKOUT_QUOTE_REQUEST });
    try {
        const normalizedPayload = {
            ...payload,
            orderItems: normalizeOrderItemsPayload(payload?.orderItems),
        };

        const { data } = await axios.post(`${baseURL}orders/quote`, normalizedPayload, {
            timeout: 12000,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: CHECKOUT_QUOTE_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data?.message || error?.response?.data || error.message;
        dispatch({ type: CHECKOUT_QUOTE_FAIL, payload: message });
        throw error;
    }
};

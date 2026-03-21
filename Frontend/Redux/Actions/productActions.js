import axios from 'axios';
import baseURL from '../../constants/baseurl';
import {
    PRODUCTS_REQUEST,
    PRODUCTS_SUCCESS,
    PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_BY_ID_REQUEST,
    PRODUCT_BY_ID_SUCCESS,
    PRODUCT_BY_ID_FAIL,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_CREATE_FAIL,
    PRODUCT_UPDATE_REQUEST,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_UPDATE_FAIL,
    PRODUCT_DELETE_REQUEST,
    PRODUCT_DELETE_SUCCESS,
    PRODUCT_DELETE_FAIL,
} from '../constants';

export const fetchProducts = () => async (dispatch) => {
    dispatch({ type: PRODUCTS_REQUEST });
    try {
        const { data } = await axios.get(`${baseURL}products`);
        dispatch({ type: PRODUCTS_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: PRODUCTS_FAIL, payload: message });
        throw error;
    }
};

export const fetchProductDetails = (id) => async (dispatch) => {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    try {
        const { data } = await axios.get(`${baseURL}products/${id}`);
        dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: PRODUCT_DETAILS_FAIL, payload: message });
        throw error;
    }
};

export const createProduct = (formData, token) => async (dispatch) => {
    dispatch({ type: PRODUCT_CREATE_REQUEST });
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        };

        const { data } = await axios.post(`${baseURL}products`, formData, config);
        dispatch({ type: PRODUCT_CREATE_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data?.message || error?.response?.data || error.message;
        dispatch({ type: PRODUCT_CREATE_FAIL, payload: message });
        throw error;
    }
};

export const updateProduct = (id, formData, token) => async (dispatch) => {
    dispatch({ type: PRODUCT_UPDATE_REQUEST });
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        };

        const { data } = await axios.put(`${baseURL}products/${id}`, formData, config);
        dispatch({ type: PRODUCT_UPDATE_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data?.message || error?.response?.data || error.message;
        dispatch({ type: PRODUCT_UPDATE_FAIL, payload: message });
        throw error;
    }
};

export const uploadProductGalleryImages = (id, formData, token) => async () => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    };

    const { data } = await axios.put(`${baseURL}products/gallery-images/${id}`, formData, config);
    return data;
};

export const deleteProduct = (id, token) => async (dispatch) => {
    dispatch({ type: PRODUCT_DELETE_REQUEST });
    try {
        await axios.delete(`${baseURL}products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: PRODUCT_DELETE_SUCCESS, payload: id });
        return id;
    } catch (error) {
        const message = error?.response?.data?.message || error?.response?.data || error.message;
        dispatch({ type: PRODUCT_DELETE_FAIL, payload: message });
        throw error;
    }
};

export const fetchProductsByIds = (ids = []) => async (dispatch) => {
    const uniqueIds = [...new Set((ids || []).filter(Boolean))];

    if (!uniqueIds.length) {
        dispatch({ type: PRODUCT_BY_ID_SUCCESS, payload: {} });
        return {};
    }

    dispatch({ type: PRODUCT_BY_ID_REQUEST });
    try {
        const responses = await Promise.all(
            uniqueIds.map(async (id) => {
                const { data } = await axios.get(`${baseURL}products/${id}`);
                return { id, data };
            })
        );

        const productMap = responses.reduce((acc, current) => {
            acc[current.id] = current.data;
            return acc;
        }, {});

        dispatch({ type: PRODUCT_BY_ID_SUCCESS, payload: productMap });
        return productMap;
    } catch (error) {
        const message = error?.response?.data?.message || error?.response?.data || error.message;
        dispatch({ type: PRODUCT_BY_ID_FAIL, payload: message });
        throw error;
    }
};

import axios from 'axios';
import baseURL from '../../constants/baseurl';
import {
    CATEGORIES_REQUEST,
    CATEGORIES_SUCCESS,
    CATEGORIES_FAIL,
} from '../constants';

export const fetchCategories = () => async (dispatch) => {
    dispatch({ type: CATEGORIES_REQUEST });
    try {
        const { data } = await axios.get(`${baseURL}categories`);
        dispatch({ type: CATEGORIES_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: CATEGORIES_FAIL, payload: message });
        throw error;
    }
};

import axios from 'axios';
import baseURL from '../../constants/baseurl';
import {
    REVIEW_SUBMIT_REQUEST,
    REVIEW_SUBMIT_SUCCESS,
    REVIEW_SUBMIT_FAIL,
    REVIEW_SUBMIT_RESET,
} from '../constants';

export const submitReview = (productId, payload, token, reviewId = null) => async (dispatch) => {
    dispatch({ type: REVIEW_SUBMIT_REQUEST });
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const endpoint = reviewId
            ? `${baseURL}products/${productId}/reviews/${reviewId}`
            : `${baseURL}products/${productId}/reviews`;

        const method = reviewId ? axios.put : axios.post;
        const { data } = await method(endpoint, payload, config);

        dispatch({ type: REVIEW_SUBMIT_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const message = error?.response?.data || error.message;
        dispatch({ type: REVIEW_SUBMIT_FAIL, payload: message });
        throw error;
    }
};

export const resetReviewSubmit = () => ({
    type: REVIEW_SUBMIT_RESET,
});

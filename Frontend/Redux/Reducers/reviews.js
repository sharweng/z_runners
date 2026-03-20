import {
    REVIEW_SUBMIT_REQUEST,
    REVIEW_SUBMIT_SUCCESS,
    REVIEW_SUBMIT_FAIL,
    REVIEW_SUBMIT_RESET,
} from '../constants';

const initialState = {
    loading: false,
    success: false,
    error: null,
};

const reviews = (state = initialState, action) => {
    switch (action.type) {
        case REVIEW_SUBMIT_REQUEST:
            return { ...state, loading: true, success: false, error: null };
        case REVIEW_SUBMIT_SUCCESS:
            return { ...state, loading: false, success: true, error: null };
        case REVIEW_SUBMIT_FAIL:
            return { ...state, loading: false, success: false, error: action.payload };
        case REVIEW_SUBMIT_RESET:
            return initialState;
        default:
            return state;
    }
};

export default reviews;

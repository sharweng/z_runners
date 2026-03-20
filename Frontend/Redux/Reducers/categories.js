import {
    CATEGORIES_REQUEST,
    CATEGORIES_SUCCESS,
    CATEGORIES_FAIL,
} from '../constants';

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const categories = (state = initialState, action) => {
    switch (action.type) {
        case CATEGORIES_REQUEST:
            return { ...state, loading: true, error: null };
        case CATEGORIES_SUCCESS:
            return { ...state, loading: false, items: action.payload };
        case CATEGORIES_FAIL:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default categories;

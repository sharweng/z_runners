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

const initialState = {
    items: [],
    loading: false,
    error: null,
    selected: null,
    selectedLoading: false,
    selectedError: null,
    byId: {},
    byIdLoading: false,
    byIdError: null,
    creating: false,
    updating: false,
    deleting: false,
};

const products = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCTS_REQUEST:
            return { ...state, loading: true, error: null };
        case PRODUCTS_SUCCESS:
            return { ...state, loading: false, items: action.payload };
        case PRODUCTS_FAIL:
            return { ...state, loading: false, error: action.payload };

        case PRODUCT_DETAILS_REQUEST:
            return { ...state, selectedLoading: true, selectedError: null };
        case PRODUCT_DETAILS_SUCCESS:
            return { ...state, selectedLoading: false, selected: action.payload };
        case PRODUCT_DETAILS_FAIL:
            return { ...state, selectedLoading: false, selectedError: action.payload };

        case PRODUCT_BY_ID_REQUEST:
            return { ...state, byIdLoading: true, byIdError: null };
        case PRODUCT_BY_ID_SUCCESS:
            return {
                ...state,
                byIdLoading: false,
                byId: { ...state.byId, ...action.payload },
            };
        case PRODUCT_BY_ID_FAIL:
            return { ...state, byIdLoading: false, byIdError: action.payload };

        case PRODUCT_CREATE_REQUEST:
            return { ...state, creating: true, error: null };
        case PRODUCT_CREATE_SUCCESS:
            return { ...state, creating: false, items: [...state.items, action.payload] };
        case PRODUCT_CREATE_FAIL:
            return { ...state, creating: false, error: action.payload };

        case PRODUCT_UPDATE_REQUEST:
            return { ...state, updating: true, error: null };
        case PRODUCT_UPDATE_SUCCESS:
            return {
                ...state,
                updating: false,
                items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
                selected: state.selected?.id === action.payload.id ? action.payload : state.selected,
            };
        case PRODUCT_UPDATE_FAIL:
            return { ...state, updating: false, error: action.payload };

        case PRODUCT_DELETE_REQUEST:
            return { ...state, deleting: true, error: null };
        case PRODUCT_DELETE_SUCCESS:
            return {
                ...state,
                deleting: false,
                items: state.items.filter((item) => item.id !== action.payload),
            };
        case PRODUCT_DELETE_FAIL:
            return { ...state, deleting: false, error: action.payload };

        default:
            return state;
    }
};

export default products;

import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import cartItems from './Reducers/cartItems';
import products from './Reducers/products';
import orders from './Reducers/orders';
import reviews from './Reducers/reviews';
import categories from './Reducers/categories';
const reducers = combineReducers({
    cartItems: cartItems,
    products: products,
    orders: orders,
    reviews: reviews,
    categories: categories,
})

const store = createStore(
    reducers,
    applyMiddleware(thunk)
)

export default store;
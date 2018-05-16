import { createStore, applyMiddleware, compose, combineReducers } from "redux"
import { routerReducer } from "react-router-redux"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"

import globalReducer from "./globalReducer"
// import projectReducer from "./project/reducer"
// import oscMiddleware from "./middleware"

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const persistConfig = {
  key: 'root',
  storage,
}

const middleware = []
const persistedReducer = persistReducer(persistConfig, (x = {}) => x) // FIXME

const reducers = combineReducers({
  global: globalReducer,
  routing: routerReducer,
  persistent: persistedReducer
})

export const store = createStore(reducers, composeEnhancers(
  applyMiddleware(...middleware)
))

export const persistor = persistStore(store)

"use client"
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import fundManagerReducer from './slices/fundManagerSlice';
import adminMasterReducer from './slices/adminMasterSlice';
import menuReducer from './slices/menuSlice';
import selfSliceReducer from './slices/selfSlice';
import categoryReducer from './slices/categorySlice';
import productReducer from './slices/productSlice';
import ticketReducer from './slices/ticketSlice';
import walletReducer from './slices/walletSlice';
import UserticketReducer from './slices/UserticketSlice';
import eventReducer from './slices/eventSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    adminMaster: adminMasterReducer,
    fundManager: fundManagerReducer,
    menu: menuReducer,
    fund: fundManagerReducer,
    self: selfSliceReducer,
    category: categoryReducer,
    product: productReducer,
    ticket: ticketReducer,
    wallet: walletReducer,
    userticket: UserticketReducer,
    event: eventReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
    }),
});

import { createSlice } from "@reduxjs/toolkit"
import { updateCart } from "../utils/cartUtils"

const initialState = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) :{cartItems: [], shippingAddress:{}, paymentMethod:"Razorpay" }

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers:{
    addToCart: (state, action)=>{
      const item = action.payload
      const existItem = state.cartItems.find((i)=> i.keyId === item.keyId)

      if(existItem){
        state.cartItems = state.cartItems.map((j)=> j.keyId === existItem.keyId ? item : j) 
      } else {
        state.cartItems = [...state.cartItems, item]
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) =>{
      state.cartItems = state.cartItems.filter((n)=> n.keyId !== action.payload)

      return updateCart(state);
    },
    saveShippingAddress: (state, action)=> {
      state.shippingAddress = action.payload
      return updateCart(state)
    },
    savePaymentMethod: (state, action)=> {
      state.paymentMethod = action.payload
      return updateCart(state)
    },
    clearCartItems: (state, action)=>{
      state.cartItems = []
      return updateCart(state)
    }
  }
})

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems } = cartSlice.actions;

export default cartSlice.reducer
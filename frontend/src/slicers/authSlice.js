import { createSlice } from "@reduxjs/toolkit";
import { updateBuyingItem } from "../utils/cartUtils";

const initialState = {
  userInfo: localStorage.getItem("userInfo")? JSON.parse(localStorage.getItem("userInfo")) : null
}

const authSlice = createSlice({
  name:"auth",
  initialState,
  reducers:{
    setCredentials: (state, action)=>{
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload))
    },
    setBuyingItem: (state, action) => {
      if (state.userInfo) {
        state.userInfo.buyingItem = updateBuyingItem(action.payload);
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
    updatePaymentMethod: (state, action) => {
      if (state.userInfo.buyingItem) {
        state.userInfo.buyingItem.paymentMethod = action.payload;
        state.userInfo.buyingItem = updateBuyingItem(state.userInfo.buyingItem);
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
    removeBuyingItem: (state) => {
      if (state.userInfo?.buyingItem) {
        delete state.userInfo.buyingItem;
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
    logout: (state, action)=>{
      state.userInfo = null
      localStorage.removeItem("userInfo")
    }
  }
})

export const { setCredentials, setBuyingItem, updatePaymentMethod, removeBuyingItem, logout } = authSlice.actions

export default authSlice.reducer
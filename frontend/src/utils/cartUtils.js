export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
}

export const updateCart = (state) => {
  //Calculate item price
  state.itemsPrice = addDecimals(state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0))
  //Calculate shipping price (if applicable)
  state.shippingPrice = addDecimals(state.itemsPrice === 0 || state.itemsPrice >= 400 || state.paymentMethod === "Razorpay" ? 0 : 50)
  //Calculate the razorpay transaction fee (3% transaction fee)
  state.secureTransactionFee = addDecimals( state.paymentMethod === "Razorpay" ? Number((0.03 * state.itemsPrice).toFixed(2)) : 0)
  //Calculate the discount amount for pre-paid orders
  state.discount = addDecimals(state.paymentMethod === "Razorpay" ? Number((0.10 * state.itemsPrice).toFixed(2)) : 0)
  //Calculate total price
  state.totalPrice = (
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.secureTransactionFee) -
    Number(state.discount)
  ).toFixed(2)

  localStorage.setItem("cart", JSON.stringify(state))

  return state
}

export const updateBuyingItem = (actionPayload) =>{
  const updatedItem = { ...actionPayload }
  
  updatedItem.shippingPrice = addDecimals(actionPayload.price === 0 || actionPayload.price >= 400 || actionPayload.paymentMethod === "Razorpay" ? 0.00 : 50.00)
  updatedItem.secureTransactionFee = addDecimals( actionPayload.paymentMethod === "Razorpay" ? Number((0.03 * actionPayload.price).toFixed(2)) : 0.00)
  updatedItem.preOrderFee = addDecimals((actionPayload.paymentMethod === "COD" && actionPayload.actionItem === "preOrder") ? Number((0.05 * actionPayload.price).toFixed(2)) : 0.00)
  updatedItem.discount = addDecimals(actionPayload.paymentMethod === "Razorpay" ? Number((0.10 * actionPayload.price).toFixed(2)) : 0.00)

  updatedItem.totalPrice = (
    Number(updatedItem.price) + 
    Number(updatedItem.shippingPrice) + 
    Number(updatedItem.secureTransactionFee) + 
    Number(updatedItem.preOrderFee) - 
    Number(updatedItem.discount)
  ).toFixed(2)

  return updatedItem;
}
import { apiSlice } from "./apiSlice"
import { ORDERS_URL, PAYPAL_URL } from "../constants"

export const ordersApiSlices = apiSlice.injectEndpoints({
  endpoints: (builder)=>({
    verifyOrderStock: builder.mutation({
      query: (cartItems)=>({
        url: `${ORDERS_URL}/cartVerification`,
        method: "POST",
        body: {cartItems}
      })
    }),
    createOrder: builder.mutation({
      query: (order)=>({
        url: ORDERS_URL,
        method: "POST",
        body: {...order }
      })
    }),
    verifyRazorpayPayment : builder.mutation({
      query : (paymentData) =>({
        url: `${ORDERS_URL}/verifyPayment`,
        method: "POST",
        body: {...paymentData}
      })
    }),
    getOrderDetails: builder.query({
      query:(orderId)=>({
        url:`${ORDERS_URL}/${orderId}`
      }),
      keepUnusedDataFor: 5
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details })=>({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: { ...details }
      })
    }),
    getPayPalClientId: builder.query({
      query: ()=>({
        url: PAYPAL_URL
      }),
      keepUnusedDataFor: 5,
    }),
    getMyOrders: builder.query({
      query: ()=>({
        url: `${ORDERS_URL}/myorders`
      }),
      keepUnusedDataFor: 5
    }),
    getOrders: builder.query({
      query: ()=>({
        url: ORDERS_URL
      }),
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation({
      query: (orderId)=>({
        url:`${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT"
      })
    })
  })
})

export const { useVerifyOrderStockMutation, useCreateOrderMutation, useVerifyRazorpayPaymentMutation, useGetOrderDetailsQuery, usePayOrderMutation, useGetPayPalClientIdQuery, useGetMyOrdersQuery, useGetOrdersQuery, useDeliverOrderMutation } = ordersApiSlices
import { PRODUCTS_URL, UPLOAD_URL } from "../constants.js";
import { apiSlice } from "./apiSlice.js";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder)=>({
    getProducts : builder.query({
      query : ({ keyword, pageNumber, pageSize })=> ({
        url : PRODUCTS_URL,
        params: {
          keyword,
          pageNumber,
          pageSize
        }
      }),
      providesTags: ["Product"],
      keepUnusedDataFor: 5
    }),
    getAllProduct: builder.query({
      query : ()=> ({
        url : `${PRODUCTS_URL}/all`
      }),
      providesTags: ["Product"],
      keepUnusedDataFor:4
    }),
    getProductDetails: builder.query({
      query : (productId)=> ({
        url : `${PRODUCTS_URL}/${productId}`
      }),
      keepUnusedDataFor:4
    }),
    createProduct: builder.mutation({
      query : ()=>({
        url : PRODUCTS_URL,
        method : "POST"
      }),
      invalidatesTags: ["Product"]
    }),
    updateAnyProduct: builder.mutation({
      query: (data)=>({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Products"]
    }),
    uploadProductImage: builder.mutation({
      query: (data)=>({
        url: UPLOAD_URL,
        method: "POST",
        body: data
      })
    }),
    deleteProductImage: builder.mutation({
      query: (fileName)=>({
        url: `${UPLOAD_URL}/delete/${fileName}`,
        method: "DELETE",
      })
    }),
    deleteAnyProduct: builder.mutation({
      query: (productId)=>({
        url: `${PRODUCTS_URL}/${productId}`,
        method: "DELETE"
      })
    }),
    createReview: builder.mutation({
      query: (data)=>({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Product"]
    }),
    getTopProducts: builder.query({
      query : ()=> ({
        url : `${PRODUCTS_URL}/top`
      }),
      keepUnusedDataFor:5
    }),
    getCategorisedProduct: builder.query({
      query : ({ category, pageNumber, pageSize }) =>({
        url : `${PRODUCTS_URL}/category`,
        params: {
          category,
          pageNumber,
          pageSize
        }
      }),
      keepUnusedDataFor:5
    })
  })
})

export const { useGetProductsQuery, useGetAllProductQuery, useGetProductDetailsQuery, useCreateProductMutation, useUpdateAnyProductMutation, useUploadProductImageMutation, useDeleteAnyProductMutation, useDeleteProductImageMutation, useCreateReviewMutation, useGetTopProductsQuery, useGetCategorisedProductQuery } = productApiSlice
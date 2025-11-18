import React from 'react'
import { Col, Row } from "react-bootstrap"
import { useParams } from "react-router-dom"
import Product from "../components/Product"
import Paginate from "../components/Paginate"
import { useGetCategorisedProductQuery, useGetProductsQuery } from "../slicers/productApiSlice"
import Message from "../components/Message"
import Loader from "../components/Loader"
import Meta from "../components/Meta"

const SearchScreen = () => {
  const pageSize = 40;
  const { pageNumber, category, keyword } = useParams();

  const { 
    data: keywordData, isLoading: keywordLoading, error: keywordError, 
  } = useGetProductsQuery(
    { keyword, pageNumber, pageSize },
    { skip: !keyword }
  );

  const {
    data: categoryData, isLoading: categoryLoading, error: categoryError,
  } = useGetCategorisedProductQuery(
    { category, pageNumber, pageSize },
    { skip: !category }
  );

  return (
    <>
      <Meta title={`${category ? `Category : ${category}`: keyword && `Search | ${keyword}` }` }/>
      {keywordLoading || categoryLoading ? (
        <Loader /> 
      ) : keywordError || categoryError ? (
        <Message variant="danger">
          {(keywordError || categoryError)?.data?.message || (keywordError || categoryError).error}
        </Message>
      ) :<>
        <Row className="mx-0 px-0 px-sm-0 px-md-4 px-xl-6">
          {(keywordData || categoryData)?.products.map((product) => (
            <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3} className="p-0">
              <Product product={product} />
            </Col>
          ))}
        </Row>
        <Paginate pages={(keywordData || categoryData).pages} page={(keywordData || categoryData).page || 1} keyword={keyword ? keyword : ""} category={category? category : ""} />
      </>
      }
    </>
  )
}

export default SearchScreen

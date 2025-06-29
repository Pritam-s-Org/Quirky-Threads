import React from 'react'
import { Link } from "react-router-dom"
import { Carousel, Image } from "react-bootstrap"
import Loader from "./Loader"
import Message from "./Message"
import { useGetTopProductsQuery } from "../slicers/productApiSlice"

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery()

  return (
    isLoading ? <Loader /> : error ? <Message variant="danger">{error?.data?.message || error.error}</Message> :
      <Carousel pause="hover" className="bg-warning mb-4" interval={3000}>
        {products.map(product => (
          <Carousel.Item key={product._id}>
            <Link to={`/product/${product._id}`} className="p-0">
              <div className="d-inline-flex justify-content-between carousel-div">
                <Image src={product?.variants[0]?.image} alt={product.name} style={{ height: "75vh", objectFit: "cover" }} fluid />
                <h3 style={{ margin: "1%", lineHeight: "150%" }} className="my-auto d-none d-md-block text-end"><b>{product.description}</b></h3>
              </div>
              <Carousel.Caption className="carousol-caption">
                <h2>{product.name} at only <b>₹{product.price}</b></h2>
              </Carousel.Caption>
            </Link>
          </Carousel.Item>
        ))}
      </Carousel>
  )
}

export default ProductCarousel

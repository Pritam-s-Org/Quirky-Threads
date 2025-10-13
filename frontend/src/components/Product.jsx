import React from 'react'
import Rating from "./Rating"
import { Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { BASE_URL } from "../constants"

const Product = ( {product} ) => {
  return (
    <Card className="my-3 p-3 rounded fixed-height hover-popup-animation">
      <Link to={`/product/${product._id}`} className="position-relative d-inline-block">
        <Card.Img src={BASE_URL + product?.variants[0]?.images[0]} variant="top" style={{height:"16rem", objectFit: "cover"}} />
        {product.totalInStock <= 0 && <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />}
      </Link>
      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as="div" className="product-title">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>
        <Card.Text as="div">
          <Rating value={product.rating} text={`${product.numReviews} reviews`}/>
        </Card.Text>
        <Card.Text as="h3">
          ₹{product.price}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Product

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Col, Row, Image, ListGroup, Card, Button } from "react-bootstrap";
import { FaArrowCircleLeft } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux";
import Rating from "../components/Rating";
import { useGetProductDetailsQuery, useCreateReviewMutation } from "../slicers/productApiSlice.js";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";
import Meta from "../components/Meta.jsx";
import { addToCart } from "../slicers/cartSlice.js";
import { toast } from "react-toastify";
import { getContrastTextColor } from "../constants.js";

const ProductScreen = () => {
  const { id: productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [size, setSize] = useState("");
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [countInStock, setCountInStock] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null)

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId)
  const [createReview, { isLoading: isReviewLoading }] = useCreateReviewMutation()
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(()=>{
    setSelectedVariant(product?.variants[0])
  }, [product, productId])

  useEffect(()=>{
    setCountInStock(selectedVariant?.sizes?.find(item => item.size === size)?.stock)
  }, [selectedVariant, size])

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, size }))
    navigate("/cart")
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    try {
      await createReview({
        productId,
        rating,
        comment
      }).unwrap()
      refetch()
      toast.success("Review Submitted!")
      setRating(0)
      setComment("")
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  useEffect(()=>{
    console.log(countInStock);
  }, [size, countInStock])

  return (
    <>
      <Link className="btn btn-light my-3" to="/"><FaArrowCircleLeft /> Back</Link>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
        <Meta 
          title={`Quirky Threads | ${product.name}`}
          description={product.description}
        />
          <Row>
            <Col md={5}>
              <Image src={selectedVariant?.image} alt={`${product.name}-${selectedVariant?.variantName}`} fluid />
            </Col>
            <Col md={4}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>{product.name} ({selectedVariant?.variantName || product.variants[0].variantName})</h3>
                </ListGroup.Item>
              </ListGroup>
              <ListGroup>
                <ListGroup.Item>
                  <Rating value={product.rating} text={`${product.numReviews} Person(s) have rated this product`} />
                </ListGroup.Item>
              </ListGroup>
              <ListGroup>
                <ListGroup.Item>
                  Price : ₹ {product.price} /- only
                </ListGroup.Item>
              </ListGroup>
              <ListGroup>
                <ListGroup.Item>
                  Color Variant:
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row className="my-2">
                    {product.variants.map( variant =>
                      <Row className="d-grid gap-2 col-4 mx-auto">
                        <Button style={{background : variant.variantName, color: getContrastTextColor(variant.variantName)}}onClick={()=>setSelectedVariant(variant)}>
                          {variant._id === selectedVariant?._id ? (<b>{variant.variantName}</b>): (variant.variantName)}
                        </Button>
                      </Row>
                    )}
                  </Row>
                </ListGroup.Item>
              </ListGroup>
              <ListGroup>
                Description : {product.description}
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col><strong>₹ {product.price}</strong></Col>
                    </Row>
                  </ListGroup.Item>
                  
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col><strong>{countInStock ? "In Stock" : "Out Of Stock"}</strong></Col>
                    </Row>
                  </ListGroup.Item>
                  {selectedVariant?.sizes?.map(each=> each.size) && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Size:</Col>
                        <Col>
                          <Form.Control
                            as="select"
                            value={size}
                            onChange={e => {
                              setSize(e.target.value);
                              setCountInStock(selectedVariant?.sizes?.find(item => item.size === e.target.value)?.stock)
                            }}>
                            {selectedVariant?.sizes?.map(each=> each.size)?.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    {countInStock?
                      <Row>
                        <Button
                          className="btn btn-dark"
                          type="button"
                          disabled={!countInStock}
                          onClick={addToCartHandler}
                        >Add to Cart</Button>
                      </Row> :
                      <Message>Please wait for the next stock update</Message>
                    }
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className="review">
            <Col md={6}>
              <h2>Reviews</h2>
              {product.reviews.length === 0 && <Message>No reviewes on this product yet.</Message>}
              <ListGroup variant="flush">
                {product.reviews.map(review => (
                  <ListGroup.Item key={review._id}>
                    <b>{review.name}</b>
                    <Rating value={review.rating} />
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                  <ListGroup.Item>
                    {isReviewLoading && <Loader />}
                    {userInfo ? (
                      <Form onSubmit={submitHandler}>
                        <Form.Group controlId="rating" className="my-2">
                          <Form.Label>Rating</Form.Label>
                          <Form.Control
                            as="select"
                            value={rating}
                            onChange={e => (setRating(Number(e.target.value)))}
                          >
                            <option value="">Select</option>
                            <option value="1">1 Star - Poor</option>
                            <option value="2">2 Star - Fair</option>
                            <option value="3">3 Star - Good</option>
                            <option value="4">4 Star - Very Good</option>
                            <option value="5">5 Star - Excellent Product</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="comment" className="my-2">
                          <Form.Label>Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                        </Form.Group>
                        <Button
                          disabled={isReviewLoading}
                          type="submit"
                          variant="dark"
                        >Submit
                        </Button>
                      </Form>
                    ) : (
                      <Message>
                        You need to <Link to="/login">Sign in</Link> first, to write a review.
                      </Message>
                    )}
                  </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default ProductScreen

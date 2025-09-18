import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Col, Row, Image, ListGroup, Card, Button } from "react-bootstrap";
import { FaArrowCircleLeft, FaCartPlus } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getContrastTextColor } from "../constants.js";
import { addToCart } from "../slicers/cartSlice.js";
import { useGetProductDetailsQuery, useCreateReviewMutation } from "../slicers/productApiSlice.js";
import Rating from "../components/Rating";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";
import Meta from "../components/Meta.jsx";
import { removeBuyingItem, setBuyingItem } from "../slicers/authSlice.js";

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
  const cart = useSelector((state) => state.cart);

  useEffect(()=>{
    setSelectedVariant(product?.variants[0])
    setSize(product?.variants[0]?.sizes[0]?.size)
  }, [product, productId])

  useEffect(()=>{
    setCountInStock(selectedVariant?.sizes?.find(item => item.size === size)?.stock)
  }, [selectedVariant, size])

  const addToCartHandler = () => {
    userInfo?.buyingItem && dispatch(removeBuyingItem());
    dispatch(addToCart({ 
      ...product, 
      variants: {...selectedVariant, sizes : selectedVariant?.sizes?.find(item => item.size === size)},
      keyId: product._id + selectedVariant?.sizes?.find(item => item.size === size)._id,
      qty:1 })
    );
    navigate("/cart")
  }

  const directBuyHandler = (actionName)=>{
    dispatch(setBuyingItem({ 
      ...product,
      actionItem: actionName,
      paymentMethod: cart.paymentMethod,
      variants: {...selectedVariant, sizes : selectedVariant?.sizes?.find(item => item.size === size)},
      keyId: product._id + selectedVariant?.sizes?.find(item => item.size === size)._id,
      qty:1 })
    );
    navigate("/placeorder")
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    try {
      await createReview({productId, rating, comment}).unwrap()
      refetch()
      toast.success("Review Submitted!")
      setRating(0)
      setComment("")
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

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
                      <Row className="d-grid gap-2 col-4 mx-auto" key={variant._id}>
                        <Button 
                          style={{background : variant.variantName, color: getContrastTextColor(variant.variantName)}} 
                          onClick={()=>setSelectedVariant(variant)}
                          className={`${variant._id === selectedVariant?._id? "border-3 shadow-none" : "border-0 shadow"} text-truncate`}
                          disabled={variant._id === selectedVariant?._id}
                        >
                          {variant._id === selectedVariant?._id ? (<b><u>{variant.variantName}</u></b>): (variant.variantName)}
                        </Button>
                      </Row>
                    )}
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  {product.totalSold} people have brought this product.
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
                    <Col>
                      <Row className="my-2">
                        <Button
                          className="btn btn-warning"
                          type="button"
                          disabled={!countInStock}
                          onClick={addToCartHandler}
                        ><u><FaCartPlus size="1.5rem" /> <b>Add to Cart</b></u></Button>
                      </Row>
                    </Col> 
                    {!countInStock && <Message>{product?.totalInStock ? "Out of stock for the selected variant/size" : "Please wait for the next stock update"}, 
                      <br />You can still order this item by using the 'Pre Order'* button.<br />(T&C Apply)</Message>}
                  </ListGroup.Item>
                  {/************* Pre Order Item  Button *****************/}
                  <ListGroup.Item>
                    {!countInStock ?
                      <Col>
                        <Row>
                          <Button
                            className="btn btn-warning mx-auto"
                            type="button"
                            onClick={()=>directBuyHandler("preOrder")}
                            ><u><FaCartPlus size="1.5rem" /> <b>Pre Order</b></u>*
                          </Button>
                        </Row>
                        <p style={{color: "maroon", fontSize: "0.8rem"}} className="mx-auto">*pre booking charge applicable for COD order</p>
                      </Col> : userInfo &&
                      <Row className="my-2">
                        {/***************** Buy Now / Order Now Button *******************/}
                        <Button
                          className="btn btn-warning py-0"
                          type="button"
                          disabled={!countInStock}
                          style={{ fontFamily: "'Racing Sans One', sans-serif", fontSize: "2rem", color: "maroon" }}
                          onClick={()=> directBuyHandler("buyNow")}
                        ><u>Order Now!!</u></Button>
                      </Row>
                    }
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className="review">
            <Col md={6}>
              <h2>Reviews</h2>
              {!product.reviews.length && <Message>Be the first person to review this product.</Message>}
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
                            placeholder="Add your comment (max 250 character)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value.slice(0,250))}
                          />{comment && <p style={{color: `${250-comment.length > 20? "black" : "red"}`, fontSize: "0.8rem", textAlign: "end"}}>characters left {250 - comment.length}</p>}
                        </Form.Group>
                        <Button
                          disabled={isReviewLoading}
                          type="submit"
                          variant="dark"
                        >Submit</Button>
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

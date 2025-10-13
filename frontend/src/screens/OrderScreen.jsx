import React from 'react'
import { Link, useParams } from "react-router-dom"
import { Row, Col, ListGroup, Image, Button, Card } from "react-bootstrap"
import Message from "../components/Message"
import Loader from "../components/Loader"
import Meta from "../components/Meta.jsx"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import { useGetOrderDetailsQuery, usePayOrderMutation, useDeliverOrderMutation } from "../slicers/orderApiSlices"
import { BASE_URL, dateFormatting } from "../constants.js"

const OrderScreen = () => {
  const { id: orderId } = useParams()

  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId)
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation()
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation()

  const { userInfo } = useSelector((state) => state.auth)

  async function onApprovePayment() {
    await payOrder({orderId, details: { payer: {} }}).unwrap()
    refetch();
    toast.success("Payment Successful!")
  }

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap()
      refetch()
      toast.success("Order Delivered")
    } catch (err) {
      toast.error(err?.data?.message || err.message)
    }
  }

  return (
    isLoading ? (<Loader />) :
      error ? (<>
          <Meta title={`Quirky Threads | Unauthotized`} />
          <Message variant="danger">{error?.data?.message || error.error}</Message>
          </>
        ) : (
          <>
            <Meta title={`Quirky Threads | Order-${order._id}`} />
            <h1>Order Id: {order.orderId}</h1>
            <Row>
              <Col md={8}>
                <ListGroup>
                  <ListGroup.Item>
                    <h2>Shipping</h2>
                    <p>
                      <b>Name: </b>{order?.user?.name}
                    </p>
                    <p>
                      <b>Email: </b>{order?.user.email}
                    </p>
                    <p>
                      <b>Address: </b>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.district}, {order.shippingAddress.state}, PIN- {order.shippingAddress.pinCode}
                    </p>
                    <p>{order.isDelivered ?
                      (<Message variant="success">Delivered on {dateFormatting(order.deliveredDate)}</Message>) :
                      (<Message variant="danger">Yet to be deliver.</Message>)
                    }
                    </p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h2>Payment Method</h2>
                    <p><b>Method: </b>{order.paymentMethod}</p>
                    {order.isPaid ? (
                      <Message variant="success">Paid on {dateFormatting(order.paidAt)}</Message>
                    ) : (
                      <Message variant="danger">Payment not received yet</Message>
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h2>Order Items</h2>
                    {order.orderItems.map((item, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col md={1}><Image src={`${BASE_URL}/${item.images[0]}`} alt={`${item.name}-${item.variantColor}`} fluid rounded /></Col>
                          <Col md={5}>
                            <Link to={`/product/${item.product}`}>{item.name} ({item.variantColor})</Link>
                            <h6>Size : {item.size}</h6>
                          </Col>
                          <Col md={2}>
                            <h5>{item.qty} Unit</h5>
                          </Col>
                          <Col md={4}>
                            <h5>₹{item.price} × {item.qty} = ₹{item.qty * item.price}</h5>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={4}>
                <Card>
                  <ListGroup>
                    <ListGroup.Item>Order Summary</ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Items</Col>
                        <Col className="text-end">₹{order.itemsPrice.toFixed(2)}</Col>
                      </Row>
                      <Row>
                        <Col>Shipping</Col>
                        <Col className="text-end">+ ₹{order.shippingPrice.toFixed(2)}</Col>
                      </Row>
                      {order.secureTransactionFee > 0 && <Row>
                        <Col>Transaction Fee</Col>
                        <Col className="text-end">+ ₹{order.secureTransactionFee.toFixed(2)}</Col>
                      </Row>}
                      {order.preOrderFee > 0 && <Row>
                        <Col>Pre Ordering Fee</Col>
                        <Col className="text-end">+ ₹{order.preOrderFee.toFixed(2)}</Col>
                      </Row>}
                      <Row>
                        <Col>Discount</Col>
                        <Col className="text-end">- ₹{order.discount.toFixed(2)}</Col>
                      </Row>
                      <hr />
                      <Row>
                        <Col>Total</Col>
                        <Col className="text-end">₹{order.totalPrice}</Col>
                      </Row>
                    </ListGroup.Item>
                    {userInfo && userInfo.role === "admin" && !order.isPaid && !order.isDelivered ? (
                      <ListGroup.Item>
                        <Button onClick={onApprovePayment} className="mx-auto d-grid col-8" variant="warning">Payment Received</Button>
                      </ListGroup.Item>
                    ) : userInfo && userInfo.role === "admin" && order.isPaid && !order.isDelivered &&
                      <ListGroup.Item>
                        <Button className="mx-auto d-grid col-8" onClick={deliverOrderHandler} variant="success">Mark As Delivered</Button>
                      </ListGroup.Item>
                    }
                    {(loadingDeliver || loadingPay) && <Loader />}
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          </>
        )
  )
}

export default OrderScreen

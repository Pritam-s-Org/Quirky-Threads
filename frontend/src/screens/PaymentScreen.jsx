import React from 'react'
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Form, Button, Col, Row } from "react-bootstrap"
import FormContainer from "../components/FormContainer"
import CheckoutSteps from "../components/CheckoutSteps"
import Meta from "../components/Meta.jsx"
import { savePaymentMethod } from "../slicers/cartSlice"
import { updatePaymentMethod } from "../slicers/authSlice.js"

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState("Razorpay")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo } = useSelector((state) => state.auth)
  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  useEffect(() => {
    if (!shippingAddress) {
      navigate("/shipping")
    }
  }, [shippingAddress, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    userInfo?.buyingItem?.paymentMethod && dispatch(updatePaymentMethod(paymentMethod));
    dispatch(savePaymentMethod(paymentMethod))
    navigate("/placeorder")
  }

  return (
    <FormContainer>
      <Meta title={"Quirky Threads | Payment"} />
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <hr />
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-4">
          <Form.Label as="legend">Select method</Form.Label>
          <Col>
            <Row className={`py-2 align-tems-center border-2 border-warning`}>
              <Form.Check
                  type="radio"
                  className="my-2"
                  label="Online Payment (Avail Additional 10% Discount on every order)"
                  id="Razorpay"
                  value="Razorpay"
                  checked={"Razorpay" === paymentMethod}
                  onClick={(e) => setPaymentMethod(e.target.value)}
                  disabled={cart.totalPrice - cart.secureTransactionFee > 50000}
              />
            </Row>
            <Row>
              <Form.Check
                type="radio"
                className="my-2"
                label="Cash on Delivary (For orders less than ₹10,000)"
                id="COD"
                value="COD"
                checked={"COD" === paymentMethod}
                onClick={(e) => setPaymentMethod(e.target.value)}
                disabled={cart.totalPrice - cart.secureTransactionFee > 10000}
              />
            </Row>
          </Col>
        </Form.Group>
        <Button type="submit" variant="warning">Continue</Button>
      </Form>
    </FormContainer>
  )
}

export default PaymentScreen

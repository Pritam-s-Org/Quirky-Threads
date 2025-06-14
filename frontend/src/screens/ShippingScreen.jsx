import React from 'react'
import { useState } from "react"
import { Form, Button, Collapse, Col } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import FormContainer from "../components/FormContainer"
import Meta from "../components/Meta.jsx"
import { saveShippingAddress } from "../slicers/cartSlice"
import CheckoutSteps from "../components/CheckoutSteps"
import stateData from "../assetes/statesAndDistricts.json"
import { toast } from "react-toastify"
import { FaAngleDown, FaAngleUp } from "react-icons/fa"

const ShippingScreen = () => {
  // console.log(stateData.);
  
  const cart = useSelector((state)=> state.cart)
  const { userInfo } = useSelector((state)=> state.auth)
  const { shippingAddress } = cart

  const [open, setOpen] = useState(false);
  const [shippingName, setShippingName] = useState(userInfo?.name || "")
  const [shippingEmail, setShippingEmail] = useState(userInfo?.email || "")
  const [shippingPhoneNumber, setShippingPhoneNumber] = useState(userInfo?.mobileNo || "")
  const [address, setAddress] = useState(shippingAddress?.address || "")
  const [city, setCity] = useState(shippingAddress?.city || "")
  const [district, setDistrict] = useState(shippingAddress?.district || "")
  const [state, setState] = useState(shippingAddress?.state || "")
  const [pinCode, setPincode] = useState(shippingAddress?.pinCode || "")
  const [landmark, setLandmark] = useState(shippingAddress?.landmark || "Near ")
  const [shippingNote, setShippingNote] = useState(shippingAddress?.shippingNote || "")

  const dispatch = useDispatch()
  const navigate = useNavigate()
  
    const submitHandler = (e) => {
      e.preventDefault()
      if (address.length < 10) return toast.error("Please re-check your address, it must be at least 10 characters atleast");
      if (city.length < 4) return toast.error("Please re-check your city name, it must be 4 characters at least");
      if (pinCode.length !== 6) return toast.error("Pin code must be 6 digits");
      if (!shippingName || !shippingEmail.includes("@") || !shippingEmail.includes(".") || shippingPhoneNumber.length < 10 ) return toast.error("Please Open the \"Basic Details\" Section from the dropdown and re-check it.")
      dispatch(saveShippingAddress({shippingName, shippingEmail, shippingPhoneNumber, address, city, district, state, pinCode, landmark, shippingNote}))
      navigate("/payment")
    }
    
  return (
    <FormContainer>
      <Meta title={"Quirky Threads | Shipping"}/>
      <CheckoutSteps step1 step2 />
      <h1>Shipping</h1>
      <hr />
      <Form onSubmit={submitHandler}>
        <Col onClick={() => setOpen(!open)} aria-controls="basic-details-section" aria-expanded={open} cursor="pointer" style={{cursor: "pointer"}}>
          <h5>Change basic details for this order? {" "} {!open ? <FaAngleDown /> : <FaAngleUp />}</h5>
        </Col>
        <Collapse in={open}>
        <Col id="basic-details-section">
          <Form.Group controlId="shippingName" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="This name will appear on the order"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value.slice(0, 50))}
              required
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="shippingEmail" className="my-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="This name will appear on the order"
              value={shippingEmail}
              onChange={(e) => setShippingEmail(e.target.value)}
              required
            ></Form.Control>
            <p style={{color: "navy", fontSize: "0.8rem"}}>Order confirmation mail will be sent to this mail id</p>
          </Form.Group>
          <Form.Group controlId="shippingPhoneNumber" className="my-2">
            <Form.Label>Mobile</Form.Label>
            <Form.Control
              type="text"
              placeholder="This name will appear on the order"
              value={shippingPhoneNumber}
              onChange={(e) => /^\d*$/.test(e.target.value) && setShippingPhoneNumber(e.target.value.slice(0,10))}
              required
            ></Form.Control>
            <p style={{color: "navy", fontSize: "0.8rem"}}>This number will be shared with the delivary person</p>
          </Form.Group>
          <hr />
        </Col>
      </Collapse>
        <Form.Group controlId="address" className="my-2">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter shipping address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="city" className="my-2">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter shipping city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="district" className="my-2">
          <Form.Label>District</Form.Label>
          <Form.Control
            as="select"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          >
          {state ?
            <>
              <option value="">Select District</option>
              {stateData[state].map((dist) => <option key={dist} value={dist}>{dist}</option>)}
            </>
           : <option value="">Please select a state first</option>
          }
          </Form.Control>
          <Form.Label>State</Form.Label>
          <Form.Control
            as ="select"
            value={state}
            onChange={(e) => {setState(e.target.value); setDistrict("")}}
          >
            <option value="">Select State</option>
              {Object.keys(stateData).map((stateName) => (
              <option key={stateName} value={stateName}>{stateName}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="pinCode" className="my-2">
          <Form.Label>Pin Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your area postal code"
            value={pinCode}
            onChange={(e)=> /^\d*$/.test(e.target.value) && setPincode(e.target.value.slice(0, 6))}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="landmark" className="my-2">
          <Form.Label>Landmark</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Your Nearest Identyfing Place"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value.slice(0, 50))}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="shippingNote" className="my-3">
          <Form.Label>Shipping Note</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter Delivary Note (Max 150 Character)"
            value={shippingNote}
            onChange={(e) => setShippingNote(e.target.value.slice(0, 150))}
          />{shippingNote && <p style={{color: `${150-shippingNote.length > 20? "navy" : "red"}`, fontSize: "0.8rem", textAlign: "end"}}>characters left {150-shippingNote.length}</p>}
        </Form.Group>
        <Button
          type="submit" 
          variant="warning" 
          className="my-2"
          disabled={!address || !city || !district || !state || !pinCode}
        >Continue</Button>
      </Form>
    </FormContainer>
  )
}

export default ShippingScreen

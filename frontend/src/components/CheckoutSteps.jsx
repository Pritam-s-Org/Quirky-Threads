import React from "react";
import { Container, Nav, ProgressBar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [step1, step2, step3, step4];

  return (
    <Container className="max-width-80vw">
      <Nav className="justify-content-center mb-1">
        <Nav.Item>
          {step1 ? (
            <LinkContainer to="/login">
              <Nav.Link><b>Sign In</b></Nav.Link>
            </LinkContainer>
          ) : (
            <Nav.Link disabled>Sign In</Nav.Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {step2 ? (
            <LinkContainer to="/shipping">
              <Nav.Link><b>Shipping</b></Nav.Link>
            </LinkContainer>
          ) : (
            <Nav.Link disabled>Shipping</Nav.Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {step3 ? (
            <LinkContainer to="/payment">
              <Nav.Link><b>Payment</b></Nav.Link>
            </LinkContainer>
          ) : (
            <Nav.Link disabled>Payment</Nav.Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {step4 ? (
            <LinkContainer to="/placeorder">
              <Nav.Link><b>Place Order</b></Nav.Link>
            </LinkContainer>
          ) : (
            <Nav.Link disabled>Place Order</Nav.Link>
          )}
        </Nav.Item>
      </Nav>
      <ProgressBar variant="warning" now={steps.filter(Boolean).length*25} className="mb-3 mt-0" style={{height: "8px"}} label={steps[1]}/>
    </Container>
  )
}

export default CheckoutSteps

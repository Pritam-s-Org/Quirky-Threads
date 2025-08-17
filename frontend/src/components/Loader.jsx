import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = ({size=100}) => {
  return (
    <Spinner
      color="blue"
      animation="border"
      role="status"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        margin: "auto",
        display: "block"
      }}
    ></Spinner>
  )
}

export default Loader
import React from 'react'
import { Link } from "react-router-dom"
import { Button, Table } from "react-bootstrap"
import { FaTimes, FaCheckSquare } from "react-icons/fa"
import Message from "../../../components/Message"
import Loader from "../../../components/Loader"
import Meta from "../../../components/Meta"
import { dateFormatting } from "../../../constants"
import { useGetPreOrdersQuery } from "../../../slicers/orderApiSlices"
import AvatarGroup from "../../../components/AvatarGroup"
import { toast } from "react-toastify"
import { useState } from "react"

const PreOrdered = () => {
  const { data: orders, isLoading, error } = useGetPreOrdersQuery();

  const [mfdCompleted, setMfdCompleted] = useState(false)

  const handleDelivaryMark = () =>{
    if (window.confirm("By clicking this you're confirming that the production of the t-shirt has been completed.")) {
      setMfdCompleted(true);
      toast.info("Now you're viewing the demo functionality, it's going to look like in future after complete development. current status will be reset soon.")
    }
    setTimeout(() => {
      setMfdCompleted(false);
    }, 8000);
  }

  return (
    <>
      <Meta title={"Quirky Threads | Manufacturer | Pre Order List"}/>
      <h1>Orders</h1>
      {isLoading ? <Loader /> :
        error ? (<Message variant="danger">{error.message}</Message>) :
          (<Table striped hover responsive className="table-sm" variant="warning">
            <thead>
              <tr>
                <th>Sl no.</th>
                <th>Order ID</th>
                <th>Order Date</th>
                <th className="text-start">Image</th>
                <th>Name</th>
                <th>Color</th>
                <th>Size</th>
                <th>Delivery Date</th>
                <th>Mark Delivery</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{++index}.</td>
                  <td>{order.orderId.slice(4)}</td>
                  <td>{dateFormatting(order.createdAt).substring(0,10)}</td>
                  <td><AvatarGroup avatars={order.orderItems} size={35} /></td>
                  <td>
                    <Link to={`/product/${order.orderItems[0].product}`}>
                      <b className="text-decoration-none">{order.orderItems[0].name}</b>
                    </Link>
                  </td>
                  <td>{order.orderItems[0].variantColor}</td>
                  <td>{order.orderItems[0].size}</td>
                  <td>
                    {order.orderItems[0].mfdDate || mfdCompleted ? (
                      dateFormatting(order.orderItems[0].mfdDate || new Date().toISOString()).substring(0,10)
                    ) : <FaTimes color="red" size={22}/>}
                  </td>
                  <td>
                    {order.orderItems[0].mfdDate || mfdCompleted ? (
                      <FaCheckSquare color="green" size={23}/>
                    ) : <Button type="button" className="btn btn-outline-primary" variant="outline" onClick={handleDelivaryMark}/>}
                  </td>
                </tr>
              ))}
              <tr></tr>
            </tbody>
          </Table>)
      }
    </>
  )
}

export default PreOrdered

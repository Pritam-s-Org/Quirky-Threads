import React from 'react'
import { Link } from "react-router-dom"
import { Button, Table } from "react-bootstrap"
import { toast } from "react-toastify"
import { FaTimes, FaCheckSquare } from "react-icons/fa"
import { dateFormatting } from "../../../constants"
import { useDeliverOrderMutation, useGetPreOrdersQuery } from "../../../slicers/orderApiSlices"
import Message from "../../../components/Message"
import Loader from "../../../components/Loader"
import Meta from "../../../components/Meta"
import AvatarGroup from "../../../components/AvatarGroup"

const PreOrdered = () => {
  const { data: orders, isLoading, error, refetch } = useGetPreOrdersQuery();
  const [ deliverOrder, {isLoading: loadingPreparation}] = useDeliverOrderMutation();

  const handleDelivaryMark = async (orderId) =>{
    if (window.confirm("By clicking this you're confirming that the production of the t-shirt has been completed.\n\nAre you confirm about it?")) {
        const res = await deliverOrder(orderId);
        if (res && res.data?.mfgDate) {
          toast.success(`Manufactor Completed marked for order id -\n${res.data.orderId}`)
        } else {
          toast.error( res.error?.data?.message || "There's some issue with manufactured marking, however the date of manufacture has been updated on backend.\nPlease report to admin about the issue.")
        }
        refetch();
    }
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
                <th>Manufacture Date</th>
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
                    {order.mfgDate ? (
                      dateFormatting(order.orderItems[0].mfgDate || new Date().toISOString()).substring(0,10)
                    ) : <FaTimes color="red" size={22}/>}
                  </td>
                  <td>
                    {order.mfgDate ? 
                    <FaCheckSquare color="green" size={23}/>
                    : loadingPreparation ? <Loader size={23} />
                    : <Button type="button" className="btn btn-outline-primary" variant="outline" onClick={()=>handleDelivaryMark(order._id)}/>}
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

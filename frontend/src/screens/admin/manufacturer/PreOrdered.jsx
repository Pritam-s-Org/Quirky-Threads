import React from 'react'
import { Link } from "react-router-dom"
import { Button, Table } from "react-bootstrap"
import { toast } from "react-toastify"
import { FaTimes, FaCheckSquare, FaInfoCircle } from "react-icons/fa"
import { useSelector } from "react-redux"
import { dateFormatting } from "../../../constants"
import { useMarkMfdCompletedMutation, useGetPreOrdersQuery } from "../../../slicers/orderApiSlices"
import Message from "../../../components/Message"
import Loader from "../../../components/Loader"
import Meta from "../../../components/Meta"
import AvatarGroup from "../../../components/AvatarGroup"

const PreOrdered = () => {
  const { userInfo } = useSelector((state) => state.auth)

  const { data: orders, isLoading, error, refetch } = useGetPreOrdersQuery();
  const [ markMfdCompleted, {isLoading: loadingPreparation}] = useMarkMfdCompletedMutation();

  const handleDelivaryMark = async (orderId) =>{
    if (window.confirm("By clicking this you're confirming that the production of the t-shirt has been completed.\n\nAre you confirm about it?")) {
        const res = await markMfdCompleted(orderId);
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
                <th className="text-start">Image</th>
                <th>Name</th>
                <th>Color</th>
                <th>Size</th>
                <th>Order Date</th>
                <th>MFD Date</th>
                <th>Mark Delivery</th>
                {userInfo?.role === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{++index}.</td>
                  <td style={{fontSize: "0.8rem"}}>
                    <b>{order.orderId.toUpperCase()}</b>
                  </td>
                  <td><AvatarGroup avatars={order.orderItems} size={40} /></td>
                  <td>
                    <Link to={`/product/${order.orderItems[0].product}`} className="text-decoration-none">
                      <b>{order.orderItems[0].name}</b>
                    </Link>
                  </td>
                  <td>{order.orderItems[0].variantColor}</td>
                  <td>{order.orderItems[0].size}</td>
                  <td>{dateFormatting(order.createdAt).substring(0,10)}</td>
                  <td>
                    {order.mfgDate ? (
                      dateFormatting(order.orderItems[0].mfgDate || new Date().toISOString()).substring(0,10)
                    ) : <FaTimes color="red" size={22}/>}
                  </td>
                  <td>
                    {order.mfgDate ? 
                    <FaCheckSquare color="green" size={25}/>
                    : loadingPreparation ? <Loader size={25} />
                    : <Button type="button" className="btn btn-outline-primary rounded-1" variant="outline" onClick={()=>handleDelivaryMark(order._id)}/>}
                  </td>
                  {userInfo?.role === "admin" && 
                  <td>
                    <Link to={`/order/${order._id}`}>
                      <FaInfoCircle size={20} title="Order Details" />
                    </Link>
                  </td>}
                </tr>
              ))}
            </tbody>
          </Table>)
      }
    </>
  )
}

export default PreOrdered

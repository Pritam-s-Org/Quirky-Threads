import React from 'react'
import { LinkContainer } from "react-router-bootstrap"
import { Table, Button, Row, Col } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { useSelector } from "react-redux"
import Message from "../../components/Message"
import Loader from "../../components/Loader"
import Paginate from "../../components/Paginate"
import Meta from "../../components/Meta"
import { toast } from "react-toastify"
import { useGetAllProductQuery, useCreateProductMutation, useDeleteAnyProductMutation } from "../../slicers/productApiSlice"

const ProductListScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)

  const { data, isLoading, error, refetch } = useGetAllProductQuery()
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation()
  const [deleteAnyProduct, { isLoading: loadingDelete }] = useDeleteAnyProductMutation()

  const createProductHandler = async () => {
    if (window.confirm("Are you sure to create a new product?")) {
      try {
        await createProduct()
        refetch()
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure to delete the product?")) {
      try {
        await deleteAnyProduct(id)
        toast.success("Successfully deleted the product from your database.")
        refetch()
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  return (
    <div>
      <Meta title={"Admin | Product List | Quirky Threads"} />
      <Row className="align-items-center">
        <Col>
          <h1>All Products</h1>
        </Col>
        {userInfo && userInfo.role === "admin" && (
          <Col className="text-end">
            <Button variant="warning" className="btn-sm btn-dark m-3" onClick={createProductHandler}>
              <FaEdit /> Create Product
            </Button>
          </Col>
        )}
      </Row>
      {(isLoading || loadingCreate || loadingDelete) ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
        <>
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Sl no.</th>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>TAGS</th>
                <th>TOTAL STOCK</th>
                <th>VARIANTS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((product, index) => (
                <tr key={product._id}>
                  <td>{++index}.</td>
                  <td>
                    <a href={`/product/${product._id}`} style={{fontSize: "smaller"}}>{product._id}</a>
                  </td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td className="text-truncate">{product.tags.join(", ")}</td>
                  <td>{product.totalInStock}</td>
                  <td className="text-truncate">{product.variants?.map(variant => variant.variantName).join(", ")}</td>
                  {userInfo && userInfo.role === "admin" && (
                    <td>
                      <LinkContainer to={`/admin/products/${product._id}/edit`}>
                        <Button variant="light" className="btn-sm mx-2">
                          <FaEdit />
                        </Button>
                      </LinkContainer>
                      <Button variant="light" className="btn-sm mx-2" style={{ "color": "black" }} onClick={() => deleteHandler(product._id)}>
                        <FaTrash />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </div>
  )
}

export default ProductListScreen

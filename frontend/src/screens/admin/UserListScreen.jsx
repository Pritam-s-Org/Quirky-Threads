import React from 'react'
import { LinkContainer } from "react-router-bootstrap"
import { Table, Button } from "react-bootstrap"
import { FaTimes, FaTrash, FaEdit } from "react-icons/fa"
import Message from "../../components/Message"
import Loader from "../../components/Loader"
import Meta from "../../components/Meta"
import { toast } from "react-toastify"
import { useGetUsersQuery, useDeleteAnUserMutation } from "../../slicers/usersApiSlice"

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery()
  const [deleteAnUser, { isLoading: loadingDelete }] = useDeleteAnUserMutation()
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure to delete the user?")) {
      try {
        const res = await deleteAnUser(id)
        res.status === 200 && toast.success("Successfully deleted the user from database.")
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      } finally {
        refetch();
      }
    }
  }
  return (
    <>
      <Meta title={"Admin | List of Users | Quirky Threads"} />
      <h1>Users</h1>
      {loadingDelete && <Loader />}
      {isLoading ? <Loader /> :
        error ? (<Message variant="danger">{error.message}</Message>) :
          (<Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Sl no.</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile No.</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{++index}.</td>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td><a href={`mailto:${user.email}`} style={{ textDecoration: "none" }}>{user.email}</a></td>
                  <td><a href={`tel:+91${user.mobileNo}`} style={{ textDecoration: "none" }}>+91 {user.mobileNo.substring(0, 5)} {user.mobileNo.substring(5, 10)}</a></td>
                  <td>
                    <h6 className="mb-0">{user.role ==="admin" ? "Adm" : user.role === "manufacturer" ? "Manu" : user.role === "customer" ? "Cust" : <FaTimes color="red" />}.</h6>
                  </td>
                  <td>
                    <LinkContainer to={`/admin/user/${user._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button variant="danger" className="btn-sm mx-2" style={{ "color": "white" }} onClick={() => deleteHandler(user._id)}>
                      <FaTrash />
                    </Button>
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

export default UserListScreen

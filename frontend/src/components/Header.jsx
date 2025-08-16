import React from 'react'
import { useNavigate } from "react-router-dom"
import { Badge, Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useLogoutMutation } from "../slicers/usersApiSlice"
import { logout } from "../slicers/authSlice"
import { toast } from "react-toastify" 
import logo from '../assetes/Brand.png'
import SearchBox from "./SearchBox"

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart)
  const { userInfo } = useSelector((state) => state.auth)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [logoutApiCall] = useLogoutMutation()
  
  const logoutHandler = async()=>{
    try {
      await logoutApiCall().unwrap()
      dispatch(logout())
      navigate("/login")
      toast.success("You have been logged Out successfully!")
    } catch (err) {
      toast.error("Unable to log you out, you can check console for more details.")
      console.log(`logout error=> ${err}`)
    }
  }

  return (
    <header>
      <Navbar bg="warning" variant="warning" expand="md" className="p-2 m-0" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img src={logo} alt="Quirky Threads Brand" height="60px" className="brand navbar-brand" />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="btn-danger" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <SearchBox />
              <LinkContainer to={"/cart"}>
                <Nav.Link>
                  <FaShoppingCart /> Cart
                  {cartItems.length > 0 && (
                    <Badge pill bg="danger"
                      style={{ marginLeft: "5px" }}>
                      {/* {cartItems.reduce((a, c) => a + c.qty, 0)} */}
                      {cartItems.length}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              {userInfo && userInfo.role === "admin" && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
              {userInfo && (userInfo.role === "admin" || userInfo.role === "manufacturer") && (
                <NavDropdown title="Manufacturer" id="manufacturermenu">
                  <LinkContainer to="/manufacturer/preorderlist">
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
              { userInfo ? (
                <NavDropdown title={`${userInfo?.name?.slice(0,20)}${userInfo?.name?.length > 20 ? "..." : ""}`} id="userName">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item><FaUser /> Profile</NavDropdown.Item>
                  </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}><FaSignOutAlt /> Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FaUser /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header

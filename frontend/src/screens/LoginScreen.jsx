import React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Form, Button, Row, Col, Card } from "react-bootstrap"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import FormContainer from "../components/FormContainer.jsx"
import Loader from "../components/Loader.jsx"
import Meta from "../components/Meta.jsx"
import { useLoginMutation } from "../slicers/usersApiSlice.js"
import { setCredentials } from "../slicers/authSlice.js"
import { toast } from "react-toastify"

const LoginScreen = () => {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation()

  const { userInfo } = useSelector((state) => state.auth)

  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get("redirect") || "/"

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [userInfo, redirect, navigate])

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ loginId, password, loggedIn }).unwrap()
      dispatch(setCredentials({ ...res }))
      navigate(redirect)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  return (
    <Card className="px-4">
    <Meta title={"Quirky Threads | Login"}/>
      <FormContainer>
        <h1>Sign In</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="loginId" className="my-3">
            <Form.Label>Email Address / Mobile No.</Form.Label>
            <Form.Control
              type="text"
              placeholder="example@email.com or 9191919191"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="password" className="my-3">
            <Form.Label>Password</Form.Label>
            <div style={{ position: "relative"}}>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={()=> setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            Forgot Password? <Link to="/forgot">Reset Here</Link>
          </Form.Group>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="stayLoggedIn" checked={loggedIn} onChange={()=> setLoggedIn(!loggedIn)} />
            <label className="form-check-label" htmlFor="stayLoggedIn">
              Stay Logged in until I logout.
            </label>
            {!loggedIn && <p style={{color: "maroon", fontSize: "0.8rem"}}>You will be logged out autometically after 5 days.</p>}
          </div>
          <Button type="submit" variant="warning" className="mt-4 d-grid mx-auto col-6" disabled={isLoading}>
            <b>Sign In</b>
          </Button>
          {isLoading && <Loader />}
        </Form>
        <Row className="py-3">
          <Col className="text-center">
            New Customer? <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}>Register Here</Link>
          </Col>
        </Row>
      </FormContainer>
    </Card>
  )
}

export default LoginScreen

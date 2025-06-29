import React, { useState, useEffect }  from 'react'
import { toast } from "react-toastify"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Form, Button, Row, Col, Card } from "react-bootstrap"
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import FormContainer from "../components/FormContainer.jsx"
import Loader from "../components/Loader.jsx"
import Meta from "../components/Meta.jsx"
import { useRegisterMutation, useSendOtpMutation, useVerifyOtpMutation } from "../slicers/usersApiSlice.js"
import { setCredentials } from "../slicers/authSlice.js"
import VerifyOTPModal from "../components/VerifyOTPModal.jsx"

const RegisterScreen = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobileNo, setMobileNo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isverified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const [sendOtp, {isLoading: sendingOtp}] = useSendOtpMutation();
  const [verifyOtp, {isLoading: verifyingOtp}] = useVerifyOtpMutation();

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
    if (!name || !email || !mobileNo || !password || !confirmPassword) {
      toast.error("Please fill all the fields")
    } else if (password !== confirmPassword) {
      toast.error("Please retype the 'Confirm Password' correctly")
    } else if (password.length < 6){
      toast.error("Your password must contains atleast 6 characters")
    } else if (mobileNo.length < 10){
      toast.warning("Please re-check your mobile number")
    } else {
      try {
        const res = await register({ name, email, mobileNo, password }).unwrap()
        dispatch(setCredentials({ ...res }))
        navigate(redirect)
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  const handleSendOtp = async () => {
    if (!email ) {
      toast.error("Please enter your email address to verify")
      return;
    } else {
      try {
        const res = await sendOtp({ email, reqType: "register" }).unwrap();
        if (res.success) {
          toast.success(res.message);
          setShowOTPModal(true);
        }
      } catch (err) {
        toast.error(err?.data?.message || err.message || "Failed to send OTP");
      }
    }
  }

  const handleOTPSubmit = async (otp) => {
    try {
      if (!otp || otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP");
        return;
      }
      const res = await verifyOtp({ email, otp, reqType: "register" }).unwrap();
      if (res.success) {
        setIsVerified(true);
        res?.data?.email && setEmail(res.data.email);
        toast.success("Email verified successfully!");
        setShowOTPModal(false);
      } else {
        toast.error(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to verify OTP");
    }
  }

  return (
    <Card>
      <Meta title={"Quirky Threads | Register"}/>
      <FormContainer>
        <h1>Sign Up</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-3">
            <Form.Label>Full Name*</Form.Label>
            <Form.Control
              type="name"
              placeholder="Sourav Ganguli"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              required
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="email" className="my-3">
            <Form.Label>Email Address*</Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                type="email"
                placeholder="example@email.com"
                value={email}
                required
                onChange={(e) => !isverified && setEmail(e.target.value)}
                readOnly={isverified}
              />
              <span style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}>
                {isverified ? <FaCheck color="green"/> : 
                  sendingOtp ? <div className="spinner-border" role="status" /> :
                  <button 
                    className="btn btn-outline-warning border-0 btn-sm"
                    onClick={ async () => {handleSendOtp()}}
                    disabled={!email || !email.includes("@") || !email.includes(".") || isverified || sendingOtp}
                  ><b>Verify</b></button>
                }
              </span>
            </div>
          </Form.Group>
          <Form.Group controlId="mobileNo" className="my-3">
            <Form.Label>Mobile number*</Form.Label>
            <Form.Control
              type="text"
              placeholder="1234567890"
              value={mobileNo}
              onChange={(e) => /^\d*$/.test(e.target.value) && setMobileNo(e.target.value.slice(0, 10))}
            />
          </Form.Group>
          <Form.Group controlId="password" className="my-3">
            <Form.Label>Enter Password*</Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Set password within 6 to 25 characters."
                value={password}
                required
                onChange={(e) => {
                  e.target.value.length > 25 ? toast.warn("Password should not be more than 25 characters") :
                  setPassword(e.target.value)
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
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
          </Form.Group>
          <Form.Group controlId="confirmpassword" className="my-3">
            <Form.Label>Confirm password*</Form.Label>
            <Form.Control
              type="password"
              placeholder="Retype Your Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <h6
              hidden={confirmPassword === password.slice(0,confirmPassword.length)  || confirmPassword === ""}
              variant="danger"
              style={{color: "red"}}
            >Your Password isn't matching with entered password</h6>
          </Form.Group>
          <Button type="submit" variant="warning" className="mt-2" disabled={isLoading}>
            Register
          </Button>
          {isLoading && <Loader />}
        </Form>
        <Row className="py-3">
          <Col>
            Already have an account? <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>Login here</Link>
          </Col>
        </Row>
      </FormContainer>
      <VerifyOTPModal
        show={showOTPModal}
        handleClose={() => setShowOTPModal(false)}
        handleVerify={handleOTPSubmit}
        isVerifying = {verifyingOtp}
      />
    </Card>
  )
}

export default RegisterScreen

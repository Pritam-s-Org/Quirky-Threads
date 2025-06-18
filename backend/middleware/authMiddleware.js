import jwt from 'jsonwebtoken'
import asyncHandler from "./asyncHandler.js"
import User from "../models/userModel.js"

//Protect Middleware
const protect = asyncHandler(async (req, res, next)=>{
  let token;
  // Read the JWT form cookie
  token = req.cookies.qrt_secure_session_token
  if (token){
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.userId).select("-password")
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorised, token failed")
    }
  } else {
    res.status(401);
    throw new Error("Not authorised, no token")
  }
})

// Admin Middleware
const admin  = (req, res, next)=>{
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised as Admin")
  }
}

// Manufacturer Middleware
const manufacturer = (req, res, next)=> {
  if (req.user && (req.user.role === "manufacturer" || req.user.role === "admin")) {
    next ();
  } else {
    res.status(401);
    throw new Error("Not authorised as Manufacturer")
  }
}

export { protect, admin, manufacturer }
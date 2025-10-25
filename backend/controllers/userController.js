import { sendNewPasswordEmail, sendOTPEmail } from "../utils/sendMail.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-';

//@desc   Send a OTP to verify users email
//@route  POST /api/users/sendOtp
//@access Public
const sendOtp = asyncHandler (async (req, res)=>{
  const { email, reqType } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400);
    throw new Error("Please provide a valid mobile number.");
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const userExists = await User.findOne({ email })
    if ( reqType === "register" && userExists) {
      res.status(400)
      throw new Error("User Already Exists")
    } else if (reqType !== "register" && !userExists) {
      res.status(400)
      throw new Error("User Doesn't Exists");
    }
    await sendOTPEmail(email, otp, reqType);
    req.app.locals.otpStore[email] = otp;
    res.status(200).json({ success: true, message: "OTP sent successfully!", data: email });
  } catch (err) {
    (res.status !== 400) && res.status(442);
    res.json({ success: false, message: err.message || "Failed to send OTP" });
    console.log(err);
  }
});

//@desc   verify the OTP sent to user email
//@route  POST /api/users/verifyOtp
//@access Public
const verifyOtp = asyncHandler (async (req, res)=>{
  const { email, otp, reqType } = req.body;

  if (!otp || otp.length !== 6) {
    res.status(400);
    throw new Error("Please provide a valid OTP.");
  }

  const storedOtp = req.app.locals.otpStore[email];
  
  if (storedOtp && storedOtp === otp) {
    req.app.locals.otpStore[email] = "verified";
    if (reqType === "resetPassword") {
      delete req.app.locals.otpStore[email];
      
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404);
        throw new Error("User not found.");
      }
      
      let generatedPassword = ""
      for (let i = 1, n = charset.length; i <= 15; ++i) {
        generatedPassword += charset.charAt(Math.floor(Math.random() * n));
      }
      user.password = generatedPassword;
      try {
        await user.save();
      } catch (err) {
        res.status(400).json({success: false, message : "Unable to reset password."})
        return;
      }
      try {
        await sendNewPasswordEmail(email, generatedPassword);
      } catch (err) {
        console.log('Error sending reset password email:', err);
        res.status(442).json({ success: true, message: "Failed to send reset password email" });
        return;
      }
    }
    res.status(200).json({ success: true, message: "OTP verified successfully!" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
  }
});

//@desc   Auth user & get the token
//@route  POST /api/users/login
//@access Public
const authUser = asyncHandler (async (req, res)=>{
  const { loginId, password, loggedIn }= req.body;
  const user = await User.findOne({   
    $or: [
      { email: loginId },
      { mobileNo: loginId }
    ]
  })

  if (user && (await user.checkPwd(password)) ) {
    generateToken(res, user._id, Boolean(loggedIn));
    const previousSession = user.lastLoggedIn;
    user.lastLoggedIn = new Date();

    try {
      const updatedUser = await user.save();
      res.status(200).json({
        _id: updatedUser._id,
        email: updatedUser.email,
        mobileNo: updatedUser.mobileNo,
        name: updatedUser.name,
        role: updatedUser.role,
        loggedInTime: updatedUser.lastLoggedIn.toISOString(),
        previousSession: previousSession.toISOString(),
        loginExpire : new Date(new Date(updatedUser.lastLoggedIn).getTime() + (loggedIn ? 10 * 365 * 24 * 3600 * 1000 : 5 * 24 * 3600 * 1000)).toISOString()
      })
    } catch (err) {
      res.status(400)
      throw new Error("Unable to update the Logged In time.")
    }
  } else {
    res.status(401)
    throw new Error("Invalid email or password")
  }
})

//@desc   Register user
//@route  POST /api/users
//@access Public
const registerUser = asyncHandler (async (req, res)=>{
  const { name, email, mobileNo, password } = req.body
  
  const userExists = await User.findOne({ email, mobileNo })
  if (userExists){
    res.status(400)
    throw new Error("User Already Exists")
  }

  if ( req.app.locals.otpStore[email] && req.app.locals.otpStore[email] !== "verified") {
    res.status(400)
    throw new Error("Please verify your email with OTP before registration.")
  }
  if ( req.app.locals.otpStore[email] && req.app.locals.otpStore[email] === "verified") {
    const user = await User.create({
      name,
      email,
      mobileNo,
      password,
      lastLoggedIn: new Date()
    })
    delete req.app.locals.otpStore[email];
    if(user){
      generateToken(res, user._id)

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        loggedInTime: user.lastLoggedIn.toISOString(),
        previousSession: user.lastLoggedIn.toISOString(),
        loginExpire : new Date(new Date(user.lastLoggedIn).getTime() + 5 * 24 * 3600 * 1000).toISOString()
      })
    } else {
      res.status(400)
      throw new Error("Invald User data")
    }
  } else {
    res.status(400)
    throw new Error("Please verify your email with OTP before registration.")
  }
})

//@desc   Logout user /clear cookie
//@route  POST/api/users/logout
//@access Private
const logoutUser = asyncHandler (async (req, res)=>{
  res.cookie("jwt", "",{
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({ message: "Logged out Successfully!"})
  // res.send("Logout user.")
})

//@desc   GET user profile
//@route  GET/api/users/profile
//@access Private
const getUserProfile = asyncHandler (async (req, res)=>{
  // res.send("Get user Profile.")
  const user = await User.findById(req.user._id).populate("wishlist", "_id name rating price totalInStock numReviews")

  if(user){
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      role: user.role,
      wishlist: user.wishlist
    })
  } else {
    res.status(404)
    throw new Error("User not found.")
  }
})

//@desc   Update user profile
//@route  PUT /api/users/profile
//@access Private
const updateUserProfile = asyncHandler (async (req, res)=>{
  const user = await User.findById(req.user._id)

  const bodyEmail = req.body.email || "";

  if (!bodyEmail) {
    res.status(400)
    throw new Error("Couldn't get any email id from user.");
  }

  if (user.email !== bodyEmail && (req.app.locals.otpStore[bodyEmail] !== "verified" || !req.app.locals.otpStore[bodyEmail])) {
    res.status(400)
    throw new Error("Please verify your email with OTP before updating it.");
  }

  if(user){
    user.name = req.body.name || user.name
    user.email = bodyEmail || user.email
    user.mobileNo = req.body.mobileNo || user.mobileNo
    if(req.body.password){
      user.password = req.body.password
    }
    
    const updateUser = await user.save()
    delete req.app.locals.otpStore[bodyEmail];

    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      mobileNo: updateUser.mobileNo,
      role: updateUser.role,
      loggedInTime: new Date().toISOString()
    })
  } else{
    res.status(404)
    throw new Error("User not found")
  }
})

//@desc   GET Users
//@route  GET/api/users/
//@access Private/Admin
const getUsers = asyncHandler (async (req, res)=>{
  const users = await User.find({}).select("-password")
  res.status(200).json(users)
})

//@desc   GET Users by ID
//@route  GET/api/users/:id
//@access Private/Admin
const getUsersByID = asyncHandler (async (req, res)=>{
  const user = await User.findById(req.params.id).select("-password")
  
  if (user) {
    return res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User Not Found.")
  }
})

//@desc   Delete Users
//@route  DLEETE/api/users/:id
//@access Private/Admin
const deleteUser = asyncHandler (async (req, res)=>{
  const user = await User.findById(req.params.id)

  if (user && user.role === "admin") {
    res.status(400).json({message: "Cannot delete Admin User, you can delete it form the database only."})
  }else if(user && user.role !== "admin"){
    await User.deleteOne({_id: user._id})
    res.status(200).json({message: "User deleted from the database!"})
  } else {
    res.status(404)
    throw new Error("No user found for deletion")
  }
})

//@desc   Update Users by ID
//@route  PUT/api/users/:id
//@access Private/Admin
const updateUsersByID = asyncHandler (async (req, res)=>{
  const user = await User.findById(req.params.id)

  if(user){
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.mobileNo = req.body.mobileNo || user.mobileNo
    if(req.body.password){
      user.password = req.body.password
    }
    user.role = req.body.role

    const updateUser = await user.save()
    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      mobileNo: updateUser.mobileNo,
      role: updateUser.role
    })
  } else{
      res.status(404)
      throw new Error("User not found")
  }
})

//@desc   Add product into users wishlist
//@route  PUT /api/users/wishlist
//@access Public
const wishlistProducts = asyncHandler( async(req, res)=>{
  const selectedProductId = req.body.productId
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else if (!selectedProductId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const alreadyWishlisted = user.wishlist.some(
      (item) => item.toString() === selectedProductId
    );

    if (alreadyWishlisted) {
      user.wishlist = user.wishlist.filter(
        (item) => item.toString() !== selectedProductId
      );
    } else {
      user.wishlist.push(selectedProductId);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: alreadyWishlisted
        ? "Removed from wishlist"
        : "Added to wishlist",
      userData: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to set the wishlist for user" });
  }
})

export {
  sendOtp,
  verifyOtp,
  authUser, 
  registerUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile, 
  getUsers, 
  getUsersByID, 
  deleteUser, 
  updateUsersByID,
  wishlistProducts
};
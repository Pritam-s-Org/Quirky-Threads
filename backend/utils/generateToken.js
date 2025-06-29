import jwt from 'jsonwebtoken';

const generateToken = (res, userId)=>{
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {expiresIn: "5d" })
    //Set JWT as HTTP-only Cookie 
    res.cookie("qrt_secure_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 5 * 24 * 3600 * 1000 //1 Day = 1 * 24hours = 144*3600*1000ms
    })

}

export default generateToken
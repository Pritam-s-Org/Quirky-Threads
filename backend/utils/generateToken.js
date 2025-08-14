import jwt from 'jsonwebtoken';

const generateToken = (res, userId, neverExpire = false)=>{
  const expirationDays = neverExpire ? { expiresIn: "3650d" } : { expiresIn: "5d" };
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, expirationDays)
    //Set JWT as HTTP-only Cookie 
    res.cookie("qrt_secure_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "Lax" || "Strict" ,
      maxAge: neverExpire ? 10 * 365 * 24 * 3600 * 1000 : 5 * 24 * 3600 * 1000
    })
}

export default generateToken
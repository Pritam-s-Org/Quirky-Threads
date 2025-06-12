import bcrypt from 'bcryptjs';

const users =[
  {
    name : "Admin User",
    email: "adminadhunika@gmail.com",
    mobileNo: 7134094651,
    password: bcrypt.hashSync("12345",10),
    isAdmin: true
  },
  {
    name : "Pritam Das",
    email: "pritamdas@gmail.com",
    mobileNo: 7134094652,
    password: bcrypt.hashSync("12345",10),
    isAdmin: false
  }
]

export default users;
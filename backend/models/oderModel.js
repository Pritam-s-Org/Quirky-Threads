import mongoose, { Mongoose } from "mongoose";

const orderSchema = mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  orderItems: [
    {
      name: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      variantColor: { type: String, required: true },
      size: { type: String, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product"
      },
    }
  ],
  shippingAddress:{
    shippingPhoneNumber: { type: String, required: true },
    shippingEmail: { type: String, required: true },
    shippingName: { type: String, required: true },
    address:{ type: String, required: true},
    city:{ type: String, required: true},
    district:{ type: String, required: true},
    state:{ type: String, required: true},
    pinCode:{ type: String, required: true},
    landmark: { type: String, required: true },
    shippingNote: { type: String }
  },
  paymentMethod: {
    type: String, required: true
  },
  paymentResult :{
    id: {type: String},
    status: {type: String},
    update_time: {type: String},
    email_address: {type: String},
  },
  itemsPrice:{
    type: Number,
    required:true,
    default: 0.00
  },
  secureTransactionFee: {
    type: Number,
    required:true,
    default: 0.00
  },
  discount: {
    type: Number,
    required:true,
    default: 0.00
  },
  shippingPrice: {
    type: Number,
    required:true,
    default: 0.00
  },
  totalPrice: {
    type: Number,
    required:true,
    default:0.00
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {type:Date},
  isDelivered:{
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredDate: {
    type: Date
  },
  orderId :{
    type: String,
    required: true,
    unique: true
  },
  preOrderFee:{
    type: Number
  },
  mfgDate: {
    type: Date
  }
}, {
  timestamps: true
})

const Order = mongoose.model("Order",orderSchema)

export default Order
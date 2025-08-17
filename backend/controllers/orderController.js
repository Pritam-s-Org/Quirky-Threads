import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/oderModel.js";
import Product, { ProductView } from "../models/productModel.js";
import razorpay from "../config/razorpay.js";
import mongoose from "mongoose";

const verifyOrderStock = async (req, res) => {
	const orderItems = req.body.cartItems; // Expected: [{ keyId, qty }]
	try {
		const insufficientItems = [];

		for (const { keyId, qty } of orderItems) {
			const productId = keyId.substring(0, 24);
			const sizeId = keyId.substring(24);

			const product = await Product.findById(productId);

			if (!product) {
				insufficientItems.push({
					keyId,
					reason: "Product not found",
				});
				continue;
			}

			let sizeMatch = null;

			for (const variant of product.variants) {
				const foundSize = variant.sizes.find(
					(size) => size._id.toString() === sizeId
				);
				if (foundSize) {
					sizeMatch = foundSize;
					break;
				}
			}

			if (!sizeMatch) {
				insufficientItems.push({
					keyId,
					reason: "Size not found",
				});
				continue;
			}

			if (sizeMatch.stock < qty) {
				insufficientItems.push({
					keyId,
					availableStock: sizeMatch.stock,
					reason: "Insufficient stock",
				});
			}
		}

		if (insufficientItems.length) {
			return res.status(200).json({
				success: false,
				message: "Unable to place order.",
				issues: insufficientItems,
			});
		}

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error("Stock verification error:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

//@desc   Create a new order
//@route  POST /api/orders
//@access Private
const addOrderItems = asyncHandler(async (req, res) => {
	const {
		orderItems,
		shippingAddress,
		paymentMethod,
		itemsPrice,
		secureTransactionFee,
		shippingPrice,
		discount,
		preOrderFee,
		totalPrice,
	} = req.body;

	if (!orderItems || !orderItems.length) {
		res.status(400);
		throw new Error("No Order Items.");
	} else {
		const order = new Order({
			orderItems: orderItems.map((i) => ({
				...i,
				product: i._id,
				image: i.variants.image,
				variantColor: i.variants.variantName,
				size: i.variants.sizes.size,
				_id: undefined,
			})),
			user: req.user._id,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			secureTransactionFee,
			shippingPrice,
			discount,
			preOrderFee: preOrderFee,
			totalPrice,
			orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
		});

		try {
			await Promise.all(
				orderItems.map(async (item) => {
					const product = await ProductView.findById(item._id);
					if (!product) {
						res.status(404);
						throw new Error("Product Not Found.");
					}
					if (product.totalInStock < item.qty) {
						res.status(400);
						throw new Error(`Product '${product.name}' is currently out of stock.`);
					}
				})
			);

			(preOrderFee && paymentMethod === "RazorPay") && await Promise.all(
				orderItems.map(async (item) => {
					const product = await Product.findById(item._id);
					if (!product) throw new Error("Product not found.");
					const variant = product.variants.find((v) => v.variantName === item.variants.variantName);
					if (!variant) throw new Error("Variant could not found.");
					const sizeObj = variant.sizes.find((s) => s.size === item.variants.sizes.size);
					if (!sizeObj) throw new Error("Size counld not found.");
					if (sizeObj.stock < item.qty) {
						res.status(400);
						throw new Error("Selected item is fully sold out already.");
					}
					sizeObj.stock -= item.qty;
					await product.save();
				})
			);
			const createdOrder = await order.save();

			if (paymentMethod === "COD") {
				res.status(201).json({ data: createdOrder });
			} else if (paymentMethod === "Razorpay") {
				const options = {
					amount: parseInt(totalPrice * 100),
					currency: "INR",
					receipt: `receipt_order_${Date.now()}`,
				};
				const razorpayOrder = await razorpay.orders.create(options);
				res.status(200).json({
					data: createdOrder,
					razorpayOrderId: razorpayOrder?.id,
					key: process.env.RAZORPAY_KEY_ID,
				});
			}
		} catch (err) {
			!res.statusCode && res.status(500);
			console.log(err);
			res.json({
				success: false,
				message: err.message || err.error.description,
			});
		}
	}
});

//@desc   Verify Razorpay payment and update order status
//@route  POST /api/orders/verify-payment
//@access Private
const verifyPayment = asyncHandler(async (req, res) => {
	try {
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			orderId,
		} = req.body;

		const body = `${razorpay_order_id}|${razorpay_payment_id}`;

		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_SECRET)
			.update(body.toString())
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			res.status(400)
			throw new Error("Invalid signature, payment verification failed");
		} else if (!razorpay_order_id || !orderId) {
			res.status(400)
			throw new Error ("Missing required fields");
		}

		const order = await Order.findById(orderId);
		const paymentResponse = await razorpay.orders.fetchPayments(
			razorpay_order_id
		);

		if (
			!paymentResponse ||
			!paymentResponse.items ||
			paymentResponse.items.length === 0
		) {
			res.status(404)
			throw new Error("No payment found for this Razorpay order");
		}
		const successfulPayment = paymentResponse.items
			.filter((p) => p.status === "captured")
			.sort((a, b) => b.created_at - a.created_at)[0];

		if (!successfulPayment) {
			res.status(400)
			throw new Error("No successful payment found");
		}
		//save to database as order paid
		order.isPaid = true;
		order.paidAt = new Date();
		order.paymentResult = {
			id: successfulPayment.id,
			status: successfulPayment.status,
			update_time: new Date(successfulPayment.created_at * 1000).toISOString(),
			email_address: successfulPayment.email || "",
		};
		await order.save();
		return res.status(200).json({
			success: true,
			message: "Payment verified and order payment completed",
			data: order,
		});
	} catch (err) {
		!res.statusCode && res.status(500);
		res.json({
			success: false,
			message: err.message || err.error.description,
		});
	}
});

//@desc   Get logged in user order
//@route  GET /api/orders/myorders
//@access Private
const getMyOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find({ user: req.user._id });
	res.status(200).json(orders);
});

//@desc   Get order by ID
//@route  GET /api/orders/:id
//@access Private
const getOrderById = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id).populate(
		"user",
		"name email"
	);

	if (order) {
		res.status(200).json(order);
	} else {
		res.status(404);
		throw new Error("Order not found");
	}
});

//@desc   Update order to paid
//@route  PUT /api/orders/:id/pay
//@access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);

	if (order) {
		order.isPaid = true;
		order.paidAt = Date.now();
		order.paymentResult = {
			id: req.body.id,
			status: req.body.status,
			update_time: req.body.update_time,
			email_address: req.body.email_address,
		};
		const updateOrder = await order.save();

		res.status(200).json(updateOrder);
	} else {
		res.status(404);
		throw new Error("Order not found");
	}
});

//@desc   Update order to delivered
//@route  PUT /api/orders/:id/deliver
//@access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);

	if (order) {
		if (order.isPaid) {
			order.isDelivered = true;
			order.deliveredDate = Date.now();
			const updateOrderDelivery = await order.save();
			res.status(200).json(updateOrderDelivery);
		} else {
			res.status(400);
			throw new Error("Order not paid yet.");
		}
	} else {
		res.status(404);
		throw new Error("Order not found");
	}
});

//@desc   Get all the orders for admin
//@route  GET /api/orders
//@access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find({}).populate("user", "id name");
	res.status(200).json(orders);
});

//@desc   Get pre-ordered items for manufacturer
//@route  GET /api/orders
//@access Private/Admin or Manufacturer
const preOrderedItems =asyncHandler(async (req, res) => {
	const orders = await Order.find({preOrderFee: {$exists: true}}).select("-shippingAddress -totalPrice -user");
	res.status(200).json(orders);
});

export {
	verifyOrderStock,
	addOrderItems,
	verifyPayment,
	getMyOrders,
	getOrderById,
	updateOrderToPaid,
	updateOrderToDelivered,
	getOrders,
	preOrderedItems,
};

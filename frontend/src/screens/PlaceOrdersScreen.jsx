import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import CheckoutSteps from "../components/CheckoutSteps";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta.jsx";
import { useCreateOrderMutation, useVerifyOrderStockMutation, useVerifyRazorpayPaymentMutation} from "../slicers/orderApiSlices";
import { clearCartItems } from "../slicers/cartSlice";
import brandLogo from "../assetes/Brand.png"
import { FaEdit } from "react-icons/fa";
import { removeBuyingItem } from "../slicers/authSlice.js";

const PlaceOrdersScreen = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const cart = useSelector((state) => state.cart);
	const { userInfo } = useSelector((state) => state.auth);

	const [createOrder, { isLoading }] = useCreateOrderMutation();
	const [productStatus, { isLoading: stockChecking }] = useVerifyOrderStockMutation();
	const [verifyRazorpayPayment, { isLoading: loadingVerification }] =
		useVerifyRazorpayPaymentMutation();

	useEffect(() => {
		if (!cart.shippingAddress.address) {
			navigate("/shipping");
		} else if (!cart.paymentMethod) {
			navigate("/payment");
		}
	}, [cart, userInfo, navigate]);

	const productsToBuy = userInfo.buyingItem ? Array(userInfo.buyingItem) : cart.cartItems

	const orderItems = (Array(userInfo?.buyingItem) || cart.cartItems)?.map((item) => ({
		keyId: item?.keyId,
		qty: item?.qty,
	}));

	const placeOrderHandler = async (e) => {
		try {
			if (userInfo?.buyingItem?.actionItem !== "preOrder"){
				const response = await productStatus(orderItems).unwrap();
				if (!response.success) return toast.error("One of your order items having stock issue, please revisit your cart again.");
			}
			const orderObject = {
				orderItems: userInfo.buyingItem ? Array(userInfo.buyingItem) : cart.cartItems,
				shippingAddress: cart.shippingAddress,
				paymentMethod: cart.paymentMethod,
				itemsPrice: userInfo.buyingItem?.price || cart.itemsPrice,
				shippingPrice: (userInfo.buyingItem || cart).shippingPrice,
				secureTransactionFee: (userInfo.buyingItem || cart).secureTransactionFee,
				discount: (userInfo.buyingItem || cart).discount,
				totalPrice: (userInfo.buyingItem || cart).totalPrice
			}
			
			const res = await createOrder(userInfo.buyingItem && userInfo.buyingItem?.actionItem === "preOrder" ? {
				...orderObject,
				preOrderFee: userInfo.buyingItem?.preOrderFee
			} : orderObject).unwrap();

			if (cart.paymentMethod === "COD") {
				navigate(`/order/${res.data._id}`);
				dispatch(userInfo.buyingItem ? removeBuyingItem() : clearCartItems());
			} else if (cart.paymentMethod === "Razorpay") {
				const options = {
					key: res.key, // the Razorpay Key ID
					amount: res.data.totalPrice, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
					currency: "INR",
					name: "Quirky Threads",
					description: `Transaction for Order ID: ${res?.data?.orderId}`,
					image: brandLogo,
					order_id: res?.razorpayOrderId,
					handler: async function (response) {
						try {
							const result = await verifyRazorpayPayment({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
								orderId: res?.data?._id, // MongoDB order ID
							}).unwrap();
							if (result.success) {
								dispatch(clearCartItems());
								navigate(`/order/${res.data._id}`);
							} else {
								toast.error("Payment verification failed.");
							}
						} catch (err) {
							console.log("Error>>>>>\n" + { err });
						}
					},
					method: {
						netbanking: true,
						card: true,
						upi: true,
						wallet: true,
					},
					prefill: {
						name: userInfo.name,
						email: userInfo.email,
						contact: userInfo.mobileNo,
					},
					notes: {
						address: Object.values(cart.shippingAddress).join(', '),
						merchant_order_id: res?.data?._id,
					},
					theme: {
						color: "#7b8a8b",
					},
				};
				const rzp1 = new window.Razorpay(options);
				rzp1.on("payment.failed", function (response) {
					console.log(response.error);
          toast.error(`Error: ${response.error.description}`);
				});
				rzp1.open();
				e.preventDefault();
			}
		} catch (err) {
			console.log("Error>>>>>\n" + JSON.stringify(err.data));
			toast.error(err.data.message || JSON.stringify(err.error));
		}
	};

	return (
		<>
			<Meta title={"Quirky Threads | Place Order"} />
			<CheckoutSteps step1 step2 step3 step4 />
			{loadingVerification? 
      <Col>
        <Row><Loader /></Row>
        <Row><h4>Please wait while we verifying your payment</h4></Row>
      </Col> : (<Row>
				<Col md={8}>
					<ListGroup>
						<ListGroup.Item>
							<h2>Shipping</h2>
							<Row>
								<Col md={10} lg={11} sm={11}>
									<strong>Address: </strong>
									{cart.shippingAddress.address}, {cart.shippingAddress.landmark}.
									<br />{cart.shippingAddress.city}, {cart.shippingAddress.district}, {cart.shippingAddress.pinCode}
								</Col>
								<Col md={2} lg={1} sm={1}>
									<FaEdit size={22} onClick={() => navigate("/shipping")}/>
								</Col>
							</Row>
						</ListGroup.Item>
						<ListGroup.Item>
							<h2>Payment Method</h2>
							<Row>
								<Col md={10} lg={11} sm={11}><strong>Method: </strong>{cart.paymentMethod}</Col>
								<Col md={2} lg={1} sm={1}>
									<FaEdit size={22} onClick={() => navigate("/payment")}/>
								</Col>
							</Row>
						</ListGroup.Item>
						<ListGroup.Item>
							<h2>Order Items</h2>
							{!userInfo.buyingItem && cart.cartItems.length === 0 ? (
								<Message>Your Cart Is Empty.</Message>
							) : (
								<ListGroup variant="flush">
									{productsToBuy?.map((item, index) => (
										<ListGroup.Item key={index}>
											<Row>
												<Col md={1}>
													<Image
														src={item?.variants?.image}
														alt={`${item?.name}-${item?.variants.variantName}`}
														fluid
														rounded
													/>
												</Col>
												<Col>
													<Link to={`/product/${item?._id}`}><b>{item?.name} ({item?.variants.variantName})</b></Link>
													 <p>Size: {item?.variants?.sizes?.size}</p>
												</Col>
												<Col md={4}>
													₹{item?.price} × {item?.qty} = ₹{item?.qty * item?.price}
												</Col>
											</Row>
										</ListGroup.Item>
									))}
								</ListGroup>
							)}
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col md={4}>
					<Card>
						<ListGroup variant="flush">
							<ListGroup.Item><h2>Price Breakup</h2></ListGroup.Item>
							<ListGroup.Item>
								<Row>
									<Col>Item(s):</Col>
									<Col className="text-end">₹{Number(userInfo.buyingItem?.price || cart.itemsPrice).toFixed(2)}</Col>
								</Row>
							</ListGroup.Item>
							<ListGroup.Item>
								<Row>
									<Col>Shipping:</Col>
									<Col className="text-end">+ ₹{Number((userInfo.buyingItem || cart).shippingPrice).toFixed(2)}</Col>
								</Row>
							</ListGroup.Item>
							{cart.paymentMethod === "Razorpay" && <ListGroup.Item>
								<Row>
									<Col>Secure Transaction Fee:</Col>
									<Col className="text-end">+ ₹{(userInfo.buyingItem || cart).secureTransactionFee}</Col>
								</Row>
							</ListGroup.Item>}
							<ListGroup.Item>
								<Row>
									<Col>Discount:</Col>
									<Col className="text-end">- ₹{(userInfo.buyingItem || cart).discount}</Col>
								</Row>
							</ListGroup.Item>
							{userInfo.buyingItem?.actionItem === "preOrder" && <ListGroup.Item>
								<Row>
									<Col>Pre Order Fee (for COD orders only):</Col>
									<Col className="text-end">+ ₹{userInfo.buyingItem.preOrderFee}</Col>
								</Row>
							</ListGroup.Item>}
							<ListGroup.Item>
								<Row>
									<Col>Total:</Col>
									<Col className="text-end"><b>₹{(userInfo.buyingItem || cart).totalPrice}</b></Col>
								</Row>
							</ListGroup.Item>
							<ListGroup.Item>
								{stockChecking && <Loader />}
							</ListGroup.Item>
							<ListGroup.Item>
								<Button
									type="button"
									className="btn-warning col-12"
									disabled={ !userInfo.buyingItem && cart.cartItems.length === 0}
									onClick={placeOrderHandler}
									style={{ fontFamily: "'Racing Sans One', sans-serif", fontSize: "1.5rem" }}
								>
									{cart.paymentMethod === "Razorpay"
										? `Pay ₹${(userInfo.buyingItem || cart).totalPrice} & Place Order!`
										: "Place Order!"}
								</Button>
								{isLoading && <Loader />}
							</ListGroup.Item>
						</ListGroup>
					</Card>
				</Col>
			</Row>)}
		</>
	);
};

export default PlaceOrdersScreen;

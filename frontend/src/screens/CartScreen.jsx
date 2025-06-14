import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	Form,
	Col,
	Row,
	Image,
	ListGroup,
	Card,
	Button,
} from "react-bootstrap";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import Message from "../components/Message";
import Meta from "../components/Meta.jsx";
import { addToCart, removeFromCart } from "../slicers/cartSlice.js";
import { useVerifyOrderStockMutation } from "../slicers/orderApiSlices.js";
import { toast } from "react-toastify";
import Loader from "../components/Loader.jsx";

const CartScreen = () => {
	const [stockStatus, setStockStatus] = useState(null);
	const [resError, setResError] = useState(null);

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [productStatus, { isLoading }] = useVerifyOrderStockMutation();

	const cart = useSelector((state) => state.cart);
	const { userInfo } = useSelector((state) => state.auth);
	const { cartItems } = cart;

	const orderItems = cartItems?.map((item) => ({
		keyId: item.keyId,
		qty: item.qty,
	}));

	const addToCartHandler = (product, qty) => {
		dispatch(addToCart({ ...product, qty }));
	};

	const removeFromCartHandler = (id) => {
		dispatch(removeFromCart(id));
	};

	const handleCheckoutClick = async () => {
    try {
      setStockStatus(null)
      const res = await productStatus(orderItems).unwrap();
      setStockStatus(res);
      res.success ? navigate("/login?redirect=/shipping") : toast.warning("Please recheck your cart items.")
    } catch (err) {
      setResError(err?.data?.message || "There's some issue with the stock status with the items in your cart.");
      setStockStatus(null);
      toast.error(resError)
    }
	};

	useEffect(() => {
		const checkStock = async () => {
			try {
        setStockStatus(null);
				const res = await productStatus(orderItems).unwrap();
				setStockStatus(res);
			} catch (err) {
				setResError(err?.data?.message || "Stock verification failed");
				setStockStatus(null);
			}
		};

		if (userInfo && cartItems) {
			checkStock();
		} // eslint-disable-next-line
	}, [productStatus]);

	return (
		<Row>
			<Meta title={"Quirky Threads | Cart"} />
			<Col md={8}>
				<h1 style={{ marginBottom: "20px" }}>Shopping Cart</h1>
				<h6>
					Message : You can add upto 10 items for a product if that is available
					in stock.
				</h6>
				<hr />
				{cartItems.length === 0 ? (
					<Message>
						Your Cart is empty, <Link to={"/"}>Back to Shop</Link>.
					</Message>
				) : (
					<ListGroup variant="flush">
						{cartItems.map((item) => (
							<ListGroup.Item key={item.keyId}>
								<Row>
									<Col md={2}>
										<Image
											src={item.variants.image}
											alt={`${item.name}-${item.variants.variantName}`}
											fluid
											rounded
										/>
									</Col>
									<Col md={3}>
										<Row>
											<Link to={`/product/${item._id}`}>
												<b>{item.name} ({item.variants.variantName})</b>
											</Link>
										</Row>
										<Row>
											<span>
												Size : <b>{item.variants?.sizes?.size}</b>
											</span>
										</Row>
									</Col>
									<Col md={2}>
										<h4>₹ {item.price}</h4>
									</Col>
									<Col md={5}>
										{isLoading? <Loader /> : <Row>
											{userInfo && stockStatus ? (
												<Col xs={10} sm={4} md={10}>
													{stockStatus?.issues?.map((i) => i.keyId)
														.includes(item.keyId) && !stockStatus?.success ? (
														<Message variant="danger">
															{
																stockStatus.issues.find(
																	(i) => i.keyId === item.keyId
																)?.reason
															}. <br />Remove it and add again to update item quantity.
														</Message>
													) : (
														<Row className="align-items-center">
															<Col xs={2} sm={2} md={1} lg={1} className="text-center">
																<FaMinus
																	onClick={() =>
																		item.qty - 1 &&
																		addToCartHandler(item, item.qty - 1)
																	}
																	style={{
																		cursor:
																			item.qty - 1 ? "pointer" : "not-allowed",
																	}}
																	title={
																		item.qty - 1
																			? "Reduce Quantity"
																			: "Use the Delete Button"
																	}
																/>
															</Col>
															<Col xs={5} sm={8} md={8} lg={8}>
																<Form.Control
																	type="text"
																	name="qty"
																	value={item.qty}
																	readOnly
																	className="text-center"
																/>
															</Col>
															<Col xs={2} sm={2} md={1} lg={1} className="text-center">
																<FaPlus
																	onClick={() =>
																		item?.variants?.sizes?.stock &&
																		item.variants.sizes.stock > item.qty &&
																		item.qty < 10 &&
																		addToCartHandler(item, item.qty + 1)
																	}
																	style={{
																		cursor:
																			item.variants.sizes.stock &&
																			item.variants.sizes.stock > item.qty &&
																			item.qty < 10
																				? "pointer"
																				: "not-allowed",
																	}}
																	title={
																		item?.variants?.sizes?.stock &&
																		item.variants.sizes.stock > item.qty &&
																		item.qty < 10
																			? "Increase Quantity"
																			: "Maximum Available Stock Quantity Reached"
																	}
																/>
															</Col>
														</Row>
													)}
												</Col>
											) : (
												<Col sm={4} md={10}>
													<Message variant="warning">
														Please{" "}
														<Link to={"/login"}>
															<b>Log In</b>
														</Link>{" "}
														to Add More Quantity.
													</Message>
												</Col>
											)}
											<Col xs={2} sm={2} md={2} className="my-auto me-0">
												<Button
													type="button"
													variant="light"
													onClick={() => removeFromCartHandler(item.keyId)}
												>
													<FaTrash />
												</Button>
											</Col>
										</Row>}
									</Col>
								</Row>
							</ListGroup.Item>
						))}
					</ListGroup>
				)}
			</Col>
			<Col md={4}>
				<Card>
					<ListGroup variant="flush">
						<ListGroup.Item>
							<h2>
								Subtotal of{" "}
								<b>{cartItems.reduce((acc, item) => acc + item.qty, 0)}</b>{" "}
								item(s).
							</h2>
							₹{" "}
							{cartItems
								.reduce((acc, item) => acc + item.qty * item.price, 0)
								.toFixed(2)}
						</ListGroup.Item>
						<ListGroup.Item className="px-auto">
							<Button
								type="button"
								className="btn-block btn-warning"
								disabled={cartItems.length === 0}
								onClick={() => handleCheckoutClick()}
                style={{width: "-webkit-fill-available"}}
							>
								<b>Proceed To Checkout</b>
							</Button>
						</ListGroup.Item>
					</ListGroup>
				</Card>
			</Col>
		</Row>
	);
};

export default CartScreen;

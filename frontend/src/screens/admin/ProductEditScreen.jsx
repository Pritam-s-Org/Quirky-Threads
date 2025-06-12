import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Spinner, Table, Row, Col } from "react-bootstrap";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import Meta from "../../components/Meta";
import { toast } from "react-toastify";
import { useUpdateAnyProductMutation, useGetProductDetailsQuery, useUploadProductImageMutation } from "../../slicers/productApiSlice";
import { FaCheck, FaCopy, FaEdit, FaPencilAlt, FaTrash } from "react-icons/fa";
import VariantModal from "../../components/VariantModal";

const ProductEditScreen = () => {
	const { id: productId } = useParams();

	const [price, setPrice] = useState(0);
	const [name, setName] = useState("");
	const [tags, setTags] = useState("");
	const [description, setDescription] = useState("");
	const [variants, setVariants] = useState([]);
	const [showPopup, setShowPopup] = useState(false);
	const [isEditable, setEditable] = useState(false)
	const [isCopied, setIsCopied] = useState([false]);
	const [selectedVariant, setSelectedVariant] = useState(null);

	const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
	const [updateAnyProduct, { isLoading: loadingUpdate }] = useUpdateAnyProductMutation();
	const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();
	const navigate = useNavigate();

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			await updateAnyProduct({ productId, name, price, tags, description, variants }).unwrap();
			toast.success("Product updated");
			refetch();
			navigate("/admin/productlist");
		} catch (err) {
			toast.error(err?.data?.message || err.error);
		}
	};

	useEffect(() => {
		if (product) {
			setName(product.name);
			setPrice(product.price);
			setTags(product.tags.toString());
			setDescription(product.description);
			setVariants(product.variants);
			setIsCopied(new Array(product.variants.length).fill(false));
		}
	}, [product, productId]);

	const uploadFileHandler = async (e, index) => {
		const formData = new FormData();
		formData.append("image", e.target.files[0]);
		try {
			const res = await uploadProductImage(formData).unwrap();
			toast.success(`Server: ${res.message}`);
      handleVariantValueUpdate(index, "image", res.secure_url || res.publicUrl)
		} catch (err) {
			toast.error(err?.data?.message || err.error);
		} finally {
			refetch();
		}
	};

	const handleAddVariant = () => {
		const newVariant = {
			variantName: "",
			sizes: [],
			image: "/images/sample.jpg",
		};
		setVariants((prev) => [...prev, newVariant]);
		setIsCopied((prev) => [...prev, false]);
	};

	const handleUpdateVariant = (updatedVariant) => {
		setVariants((prev) =>
			prev.map((v) => (v._id === updatedVariant._id ? updatedVariant : v))
		);
	};

	const handleVariantValueUpdate = (index, keyName, value) => {
		const updated = [...variants];
		// if (newName?.trim() === "" || newName?.length <= 2) {
		// 	toast.error("Variant name must be between 2 and 20 characters long");
		// 	return;
		// }
		updated[index] = { ...updated[index], [keyName]: value };
		setVariants(updated);
	};

	const handleDeleteVariant = (identifier) => {
		setVariants((prev) =>
			prev.filter((variant, index) => {
				if (variant._id) {
					return variant._id !== identifier;
				} else {
					return index !== identifier;
				}
			})
		);
	};

  const copyHandler = (index) => {
		try {
			navigator.clipboard.writeText(variants[index].image);
			toast.success("URL Copied to Clipboard Successfully");
			setIsCopied((prev) => {
				const updated = [...prev];
				updated[index] = true;
				return updated;
			});
		} catch (err) {
			toast.error("Failed to copy the text");
		}
		setTimeout(() => {
			setIsCopied(false);
		}, 6000);
	};

	return (
		<>
			<Meta title={`Admin | ${name} | Quirky Threads`} />
			<Link to="/admin/productlist" className="btn btn-light my-3">
				Go back
			</Link>
			<FormContainer>
				<h1>Edit Product</h1>
				{loadingUpdate && <Loader />}
				{isLoading ? (
					<Loader />
				) : error ? (
					<Message variant="danger">{error}</Message>
				) : (
					<Form onSubmit={submitHandler}>
						<Form.Group controlId="name" className="my-3">
							<Form.Label>Name</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter Product Name"
								value={name}
								onChange={(e) => setName(e.target.value.trim())}
							/>
						</Form.Group>
						<Form.Group controlId="description" className="my-3">
							<Form.Label>Product Description</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								placeholder="Enter Product Description"
								value={description}
								onChange={(e) => setDescription(e.target.value.trim())}
							/>
						</Form.Group>
						<Form.Group controlId="price" className="my-3">
							<Form.Label>Product Price</Form.Label>
							<Form.Control
								type="number"
								placeholder="Enter Product Price"
								value={price}
								onChange={(e) => setPrice(Math.abs(e.target.value))}
							/>
						</Form.Group>
						<Form.Group controlId="tags" className="my-3">
							<Form.Label>Tags</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter Product Tags (comma separated)"
								value={tags}
								onChange={(e) =>
									/^[a-zA-Z _,]*$/.test(e.target.value) &&
									setTags(
										e.target.value
											.split(",")
											.map((e) => e.split(" "))
											.toString()
											.toLowerCase()
									)
								}
							/>
						</Form.Group>
						<h4 className="mb-3">Product Variants{loadingUpload && <Spinner animation="border" size="sm" />}</h4>
						<Table hover responsive className="table-sm">
							<thead>
								<tr>
									<th>
										<Form.Label className="mb-0">Variant Color</Form.Label>
									</th>
									<th>
										<Form.Label className="mb-0">Variant Image <FaPencilAlt onClick={() => setEditable(!isEditable)} /></Form.Label>
									</th>
									<th style={{ width: "20%" }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{variants.map((variant, index) => (
									<tr key={variant._id || `new-${index}`}>
										<td>
											<Form.Control
												type="text"
												value={variant.variantName}
												onChange={(e) => handleVariantValueUpdate( index, "variantName", e.target.value.slice(0, 20))}
												className="mb-2"
												placeholder="Enter Variant Color"
											/>
										</td>
										<td>
											<Form.Group controlId="image">
												<div style={{ position: "relative" }}>
													<Form.Control
														type="text"
														placeholder="Image url"
														value={variant.image}
														readOnly={!isEditable}
														onChange={(e)=> isEditable && handleVariantValueUpdate( index, "image", e.target.value)}
													/>
													<span 
														style={{
															position: "absolute",
															right: "10px",
															top: "50%",
															transform: "translateY(-50%)",
															cursor: "pointer",
															display: "flex",
															alignItems: "center",
															pointerEvents: isCopied[index] ? "none" : "auto"
														}}
													>
														{isCopied[index] ? <FaCheck color="green" /> : <FaCopy onClick={() => copyHandler(index)} />}
													</span>
												</div>
												<Form.Control
													className="rounded-bottom"
													type="file"
													label="Upload Product Image"
													accept="image/*"
													onChange={(e) => uploadFileHandler(e, index)}
													disabled={loadingUpload}
												/>
											</Form.Group>
										</td>
										<td>
											<Button variant="light" className="btn-sm mx-1 my-4">
												<FaEdit
													onClick={() => {
														setSelectedVariant(variant);
														setShowPopup(true);
													}}
												/>
											</Button>
											<Button
												variant="outline-danger"
												className="btn-sm mx-1 my-4"
											>
												<FaTrash
													color="black"
													onClick={() =>
														handleDeleteVariant(
															variant._id ? variant._id : index
														)
													}
												/>
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
						{showPopup && selectedVariant && (
							<VariantModal
								show={showPopup}
								handleClose={() => setShowPopup(false)}
								variant={selectedVariant}
								handleUpdate={handleUpdateVariant}
							/>
						)}
						<Col className="d-flex justify-content-between">
							<Row>
								<Button
									variant="outline-success"
									onClick={handleAddVariant}
									className="my-2"
								>
									Add Variant
								</Button>
							</Row>
							<Row>
								<Button type="submit" variant="dark" className="my-2">
									Update
								</Button>
							</Row>
						</Col>
					</Form>
				)}
			</FormContainer>
		</>
	);
};

export default ProductEditScreen;

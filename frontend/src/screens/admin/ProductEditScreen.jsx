import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Spinner, Table, Row, Col, Image } from "react-bootstrap";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import Meta from "../../components/Meta";
import { toast } from "react-toastify";
import { useUpdateAnyProductMutation, useGetProductDetailsQuery, useUploadProductImageMutation, useDeleteProductImageMutation } from "../../slicers/productApiSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import VariantModal from "../../components/VariantModal";
import { BASE_URL } from "../../constants";

const ProductEditScreen = () => {
	const { id: productId } = useParams();

	const [price, setPrice] = useState(0);
	const [name, setName] = useState("");
	const [tags, setTags] = useState("");
	const [description, setDescription] = useState("");
	const [variants, setVariants] = useState([]);
	const [showPopup, setShowPopup] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState(null);

	const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
	const [updateAnyProduct, { isLoading: loadingUpdate }] = useUpdateAnyProductMutation();
	const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();
	const [deleteProductImage, { isLoading: loadingDelete}] = useDeleteProductImageMutation();
	const navigate = useNavigate();

	const submitHandler = async (e) => {
		e.preventDefault();
		if (!variants.images.length) return toast.error("There should be atleast one image to update a product.");

		try {
			await updateAnyProduct({ productId, name:name.trim(), price, tags, description:description.trim(), variants }).unwrap();
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
		}
	}, [product, productId]);

	const handleVariantValueUpdate = (index, keyName, value) => {
		const updated = [...variants];
		updated[index] = { ...updated[index], [keyName]: value };
		setVariants(updated);
	};

	const uploadFileHandler = async (e, index) => {
		const formData = new FormData();
		formData.append("image", e.target.files[0]);
		try {
			const res = await uploadProductImage(formData).unwrap();
			toast.success(`Server: ${res.message}`);
      handleVariantValueUpdate(index, "image", [...variants[index].images, res.imagePath || res.secure_url])
		} catch (err) {
			toast.error(err?.data?.message || err.error);
		}
	};

	const handleAddVariant = () => {
		const newVariant = {
			variantName: "",
			sizes: [],
			image: ["/images/sample.jpg"],
		};
		setVariants((prev) => [...prev, newVariant]);
	};

	const handleUpdateVariant = (updatedVariant) => {
		setVariants((prev) =>
			prev.map((v) => (v._id === updatedVariant._id ? updatedVariant : v))
		);
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

	const handleDeleteImage = async (index, img) => {
		const newVariantImageList = variants[index]?.images?.filter(item => !item.includes(img));
		const imageName = img.split("/").pop();
		try {
			if (window.confirm("Are you sure to delete the image?\n\nN.B.- The image will be downloaded into your local machine for future use, before deleting from the server.")) {
				const a = document.createElement('a');
				a.href = img;
				a.download = imageName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				const res = await deleteProductImage(imageName);
				toast.success(res.message);
				handleVariantValueUpdate(index, "image", newVariantImageList);
			}
		} catch (err) {
			toast.error(err.error || err.data.message);
		}
	}	
	
	return (
		<>
			<Meta title={`Admin | ${name} | Quirky Threads`} />
			<Link to="/admin/productlist" className="btn btn-light my-3">
				Go back
			</Link>
			<Row>
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
								onChange={(e) => setName(e.target.value)}
							/>
						</Form.Group>
						<Form.Group controlId="description" className="my-3">
							<Form.Label>Product Description</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								placeholder="Enter Product Description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
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
						<h4 className="mb-3">Product Variants{(loadingUpload || loadingDelete) && <Spinner animation="border" size="sm" />}</h4>
						<Table hover responsive className="table-sm">
							<thead>
								<tr>
									<th style={{ width: "20%" }}>
										<Form.Label className="mb-0">Variant Color</Form.Label>
									</th>
									<th>
										<Form.Label className="mb-0">Variant Image</Form.Label>
									</th>
									<th style={{ width: "15%" }}>Manage Stocks</th>
									<th style={{ width: "5%" }}>Delete</th>
								</tr>
							</thead>
							<tbody>
								{variants?.map((variant, index) => (
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
												{/* <div className="position-relative">
													<Form.Control
														type="text"
														placeholder="Enter Public Image URL or Upload A New One"
														value={isEditing[index] ? variant.image[variant.image.length - 1] : ""}
														onChange={(e)=> isEditing[index] && handleVariantValueUpdate( index, "image", variant["image"][variant["image"].length - 1] = e.target.value)}
														readOnly={!isEditing[index]}
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
													{isEditing[index] ? <FaPencilRuler onClick={() => editHandler(index)} /> : <FaPencilAlt onClick={() => editHandler(index)} />}
												</div> */}
												<Form.Control
													className="rounded-bottom"
													type="file"
													label="Upload Product Image"
													accept="image/*"
													onChange={(e) => uploadFileHandler(e, index)}
													disabled={loadingUpload}
												/>
												<Row>
													{variant.images?.map((img, i)=>
													<Col className="d-flex" key={i}>
														<Image
															key={img}
															src={BASE_URL + img}
															alt={variant.name}
															title={variant.name}
															rounded
															style={{
																border: "2px solid #a07d00ff",
																margin: "0 1%",
																width: "100px"
															}}
														/><p 
															onClick={()=>handleDeleteImage(index, BASE_URL + img)}
															style={{
																cursor: "pointer",
																height: "fit-content",
																width: "1.6rem",
																background: "white",
																border: "1px solid black",
																borderRadius: "50%",
																marginLeft : "-17px",
															}}><b>✕</b>
														</p>
													</Col>
													)}
												</Row>
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
										</td>
										<td>
											<Button variant="outline-danger" className="btn-sm mx-1 my-4">
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
									disabled={!product.variants[product.variants.length -1].variantName}
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
			</Row>
		</>
	);
};

export default ProductEditScreen;

import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		name: { type: String, required: true, trim: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, required: true, trim: true },
	},
	{
		timestamps: true,
	}
);

const sizeSchema = new mongoose.Schema({
	size: { type: String, required: true, default: "M", unique: true }, // e.g., 'S', 'M', 'L'
	stock: { type: Number, required: true, default: 0, min: 0 },
});

const variantSchema = new mongoose.Schema({
	variantName: { type: String, required: true, trim: true, default: "New Variant", unique: true },
	images: { type: [String], required: true, default: ["/images/sample.jpg"], maxlength: 5},
	sizes: [sizeSchema],
});

const productSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		name: { type: String, required: true, trim: true, unique: true, maxlength: 60 },
		brand: { type: String, required: true, default: "Quirky Threads" },
		tags: { type: [String], required: true, default: ["unlisted"], maxlength: 15 },
		categories: { type: [String], required: true, default: ["new"], maxlength: 5 },
		description: { type: String, required: true, trim: true, maxlength: 200 },
		variants: {
			type : [variantSchema], 
			required: true, 
			default: [{
				variantName: "New Variant", 
				images: ["/images/sample.jpg"], 
				sizes: [{size: "M", stock: 0}]
			}]
		},
		reviews: [reviewSchema],
		rating: { type: Number, required: true, default: 0 },
		numReviews: { type: Number, required: true, default: 0 },
    totalInStock: { type: Number, required: true, default: 0},
		price: { type: Number, required: true, default: 0 },
	},
	{ timestamps: true, }
);

const Product = mongoose.model("Product", productSchema);

const ProductView = mongoose.model(
  "ProductView",
  new mongoose.Schema({}, { strict: false }),
  "productView"
);

export default Product;
export { ProductView }

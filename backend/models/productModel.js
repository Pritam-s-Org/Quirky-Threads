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
	size: { type: String, required: true, default: "M" }, // e.g., 'S', 'M', 'L'
	stock: { type: Number, required: true, default: 0, min: 0 },
});

const variantSchema = new mongoose.Schema({
	variantName: { type: String, required: true, trim: true, default: "" },
	image: { type: String, required: true, default: "/images/sample.jpg" },
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
		brand: { type: String, required: true, default: "Unknown" },
		tags: { type: [String], required: true, default: ["new"], maxlength: 15 }, 
		description: { type: String, required: true, trim: true, maxlength: 200 },
		variants: [variantSchema], // Array of variants with colors and sizes
		reviews: [reviewSchema],
		rating: {
			type: Number,
			required: true,
			default: 0,
		},
		numReviews: {
			type: Number,
			required: true,
			default: 0,
		},
    totalInStock: {
      type: Number,
      required: true,
      default: 0,
    },
		price: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{ timestamps: true, }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

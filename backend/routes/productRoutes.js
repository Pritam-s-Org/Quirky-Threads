import express from "express";
const router = express.Router();
import { getPaginatedProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, getTopProducts, getCategorisedProducts, getAllProducts } from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js"


router.route("/").get(getPaginatedProducts).post(protect, admin, createProduct)
router.route("/all").get(protect, admin, getAllProducts)
router.route("/:id/reviews").post(protect, createProductReview)
router.route("/top").get(getTopProducts)
router.route("/category/:category").get(getCategorisedProducts)
router.route("/:id").get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct)

export default router;
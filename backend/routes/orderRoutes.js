import express from "express";
const router = express.Router();
import { verifyOrderStock, addOrderItems, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered, getOrders, verifyPayment, preOrderedItems } from "../controllers/orderController.js";
import { protect, admin, manufacturer } from "../middleware/authMiddleware.js"

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);
router.route("/cartVerification").post(protect, verifyOrderStock);
router.route("/verifyPayment").post(protect, verifyPayment);
router.route("/myorders").get(protect, getMyOrders);
router.route("/preorder").get(protect, manufacturer, preOrderedItems) // preOrderedItems controller need to be created BEFORE UNCOMMENTING
// router.route("/preorder/:id").get(protect, manufacturer, preOrderedOneItem).put(protect, manufacturer, updatePreOrderedOneItem) // preOrderedItems controller need to be created BEFORE UNCOMMENTING
router.route("/:id").get(protect, getOrderById)
router.route("/:id/pay").put(protect, updateOrderToPaid)
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered)


export default router
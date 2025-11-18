import ejs from "ejs";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";
import { fileURLToPath } from "url";
import Order from "../models/oderModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const generateInvoice = async (orderId)=> {
  const now = new Date();
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

  const order = await Order.findById(orderId).populate("user", "id name");

	const invoiceNumber = `QT-${order.paidAt.getFullYear()}-${ await Order.countDocuments({
    paidAt: {
      $gte: new Date(order.paidAt.getFullYear(), 0),
      $lt: new Date(order.paidAt)
    }
  }) + 1}`;

	try {
		const html = await ejs.renderFile(path.join(__dirname, "../views/invoice.ejs"), {
			billerName : order.user.name,
      shipperName: order.shippingAddress.shippingName,
			shippingAddress: order.shippingAddress,
			invoiceNo : order.invoiceDetails?.invoiceNo || invoiceNumber,
			lastGenerated: now.toLocaleString("en-IN"),
			orderId: order.orderId,
			paymentDate: order.paidAt,
			orderItems : order.orderItems,
			totalAmount: order.totalPrice,
			shippingPrice: order.shippingPrice,
			totalPrice: order.totalPrice,
			secureTransactionFee: order.secureTransactionFee,
      port: process.env.PORT
		})

		const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"], 
    });

		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle0" });

		const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "6mm", left: "10mm" },
    });
		await browser.close();
    
    if (!order.invoiceGenerated){
      order.invoiceGenerated = true;
      order.invoiceDetails.invoiceNo = invoiceNumber;
      try {
        if (!fs.existsSync("uploads/bills")) fs.mkdirSync("uploads/bills", { recursive: true });
        const filePath = path.join(path.resolve(), "uploads/bills", `Invoice_${order.orderId}.pdf`);
        await fs.promises.writeFile(filePath, pdfBuffer);
        console.log(`Bill Generated for Order ID-${order.orderId}`);
      } catch (err) {
        console.log("PDF Uploading Error >>>>>>>>\n", err);
        throw new Error(err);
      }
    }
    order.invoiceDetails.invoiceDate = now;
    await order.save();

    return pdfBuffer;
  } catch (err) {
    console.log("PDF Generation Error >>>>>>>>\n", err);
    throw new Error(err);
	}
};

export default generateInvoice;
import ejs from "ejs";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import Order from "../models/oderModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const generateInvoice = asyncHandler(async (res, orderId)=> {
  const order = await Order.findById(orderId);

	const dateFormatter = (date) => {
		return new Date(date).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true, // For AM/PM format
			timeZone: "Asia/Kolkata",
		}).split(",")[0]
	}

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const invoiceNumber = `QT-${order.paidAt.getFullYear()}-${ await Order.countDocuments({
    paidAt: {
      $gte: new Date(order.paidAt.getFullYear(), 0),
      $lt: new Date(order.paidAt)
    }
  }) + 1}`;

  if (!order.invoiceGenerated){
    order.invoiceDetails = {
      invoiceNo: invoiceNumber,
      invoiceDate: new Date()
    }
    order.invoiceGenerated = true;
    await order.save();
  }

	try {
		const html = await ejs.renderFile(path.join(__dirname, "../views/invoice.ejs"), {
			customerName : order.user.name,
			shippingAddress: order.shippingAddress,
			invoiceNo : order.invoiceDetails?.invoiceNo || invoiceNumber,
			invoiceDate: dateFormatter(order.invoiceDetails?.invoiceDate || new Date()),
			orderId: order.orderId,
			paymentDate: dateFormatter(order.paidAt),
			orderItems : order.orderItems,
			totalAmount: order.totalPrice,
			shippingPrice: order.shippingPrice,
			totalPrice: order.totalPrice,
			secureTransactionFee: order.secureTransactionFee,
      port: process.env.PORT
		})

		const browser = await puppeteer.launch({
      headless: "new", // newer headless mode
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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="OrderInvoice${order.orderId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (err) {
    throw new Error(err);
	}
})
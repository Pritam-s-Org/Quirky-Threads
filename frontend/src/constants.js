// export const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://quirky-threads.duckdns.org"
export const BASE_URL = window.location.origin;
export const PRODUCTS_URL = "/api/products";
export const USERS_URL = "/api/users";
export const ORDERS_URL = "/api/orders";
export const UPLOAD_URL = "/api/upload";

export const dateFormatting = (date) => {
	return new Date(date)
		.toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true, // For AM/PM format
			timeZone: "Asia/Kolkata",
		})
		.replace(",", " at");
};

export const getContrastTextColor = (bgColor) => {
  const tempDiv = document.createElement("div");
  tempDiv.style.color = bgColor;
  document.body.appendChild(tempDiv);

  const rgb = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  const result = rgb.match(/\d+/g);
  if (!result) return "#000";

  const [r, g, b] = result.map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000" : "#fff";
}


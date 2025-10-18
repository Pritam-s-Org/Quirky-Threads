const allowedOrigins = [
  "https://quirky-threads.online",
  "https://preprod.quirky-threads.online",
  "https://quirky-threads.onrender.com",
  "https://quirky-threads.duckdns.org",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Not allowed"));
    }
  },
  credentials: true, // enable cookies/headers if needed
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;

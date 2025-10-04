const allowedOrigins = [
  "http://localhost:3000",
  "https://quirky-threads.onrender.com",
  "https://quirky-threads.vercel.app",
  "https://quirky-threads.online",
  "https://preprod.quirky-threads.online"
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

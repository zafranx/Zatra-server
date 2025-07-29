const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean"); // sanitize input against XSS
const cloudinary = require("cloudinary");

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST;

const { __connectToMongo } = require("./src/database/db");
__connectToMongo();

// ✅ Trust proxy if behind Nginx/Heroku
app.enable("trust proxy");

// 🔒 Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // disable if serving APIs only
    crossOriginEmbedderPolicy: false,
  })
);
app.disable("x-powered-by"); // Hide Express signature

// Prevent NoSQL Injection
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`🚨 NoSQL Injection attempt on ${req.path}:`, key);
    },
  })
);

// Prevent XSS Attacks
app.use(xss());

// // CORS Configuration
// const allowedOrigins = [process.env.FRONTEND_URL];
// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(cors());

// Rate Limiter (100 requests / 15 mins per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Body parser with size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(express.json());

// Static Uploads
app.use("/uploads", express.static("uploads"));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
const { V1 } = require("./src/routeController");
app.use("/api/v1/app", V1.APP_ROUTE);
app.use("/api/v1/admin", V1.ADMIN_ROUTE);
app.use("/api/v1/common", V1.COMMON_ROUTE);
// app.use("/api/v1/web", V1.WEBSITE_ROUTE);

// Global Error Handler (fallback)
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running at https://${host}:${port}/`);
});

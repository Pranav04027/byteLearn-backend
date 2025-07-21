import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { xss } from "express-xss-sanitizer";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";

export const applysecuritymiddlewares = (app) => {
    
  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  //Body parsers
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));

  // XSS(for HTML/JS) and mongosanitize(for $etc.) sanitization
  app.use(xss());

  //Basic rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: {
      statusCode: 429,
      success: false,
      errors: [],
      message: "Too many requests from this IP, please try again later.",
      data: null,
    },
    standardHeaders: true, // Include Rate-Limit headers
    legacyHeaders: false, // Disable X-RateLimit headers
  });
  app.use("/api", limiter);

  //Static files
  app.use(express.static("public"));

  //Cookie Parser
  app.use(cookieParser());
};

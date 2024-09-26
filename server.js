import express from "express";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import paymentRoute from "./routes/userRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connect.js";
import userRouter from "./routes/userRoutes.js";
import wasteReqRouter from "./routes/wasteReqRoutes.js";
import innovativeProdRouter from "./routes/innovativeProdRoutes.js";
import availableWasteReqRouter from "./routes/availableWasteReqRoutes.js";
import cartRouter from "./routes/cart.js";

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("RAZORPAY_API_KEY:", process.env.RAZORPAY_API_KEY);
console.log("RAZORPAY_APT_SECRET:", process.env.RAZORPAY_APT_SECRET);
console.log("PORT:", process.env.PORT);
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // to resolve payload large error

app.use(userRouter);
app.use(wasteReqRouter);
app.use(innovativeProdRouter);
app.use(availableWasteReqRouter);
app.use(cartRouter);

connectDB(process.env.MONGO_URI);

// Printing the environment variables

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

app.use("/api", paymentRoute);

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

// Export the app and instance
export { app, instance };

// Listen on the specified port if needed
if (process.env.PORT) {
  app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
  });
}
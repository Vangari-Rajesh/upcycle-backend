import express from "express";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import paymentRoute from "./routes/userRoutes.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import connectDB from "./db/connect.js";
import userRouter from "./routes/userRoutes.js";
import wasteReqRouter from "./routes/wasteReqRoutes.js";
import innovativeProdRouter from "./routes/innovativeProdRoutes.js";
import availableWasteReqRouter from "./routes/availableWasteReqRoutes.js";
import cartRouter from "./routes/cart.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // to resolve payload large error
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(userRouter);
app.use(wasteReqRouter);
app.use(innovativeProdRouter);
app.use(availableWasteReqRouter);
app.use(cartRouter);

connectDB(process.env.MONGO_URI);

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

app.use("/api", paymentRoute);

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// Export the app and instance
export default app;
export { instance };

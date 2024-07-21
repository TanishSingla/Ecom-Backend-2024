import express, { Request, Response, NextFunction } from 'express';

//Importing Routes...
import userRoute from './routes/user.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/order.js';
import paymentRoute from './routes/payment.js';
import dashboardRoute from './routes/adminDashboardChart.js';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import { config } from "dotenv";
import morgan from 'morgan'

config({
    path: "./.env"
})

//Variables
const PORT = 3000;
const app = express();
app.use(express.json());


connectDB(process.env.MONGODB_URI || "");

app.get("/", (req, resp) => {
    return resp.send(`Hi Server Running.....On Port ${process.env.PORT}`);
})

//Middlewares
app.use("/uploads", express.static("uploads"));
//middleware for error handling
app.use(errorMiddleware)
app.use(morgan("dev"))


//caching
export const myCache = new NodeCache();

//Using Routes...
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);



app.listen(PORT, () => {
    console.log(`Server Running on Port:${PORT}`)
})
import express from 'express';
import { adminOnly } from '../middlewares/auth.js';
import { deleteOrder, getAllOrders, getSingleOrder, myOrders, newOrder, processOrder } from '../controllers/order.js';

const app = express.Router();

///api/v1/order/new -> for order of new item
app.post("/new", newOrder);

// /api/v1/order/my -> to get all of my orders.
app.get("/my", myOrders)

// /api/v1/order/all -> to get all orders (admin only)
app.get("/all", adminOnly, getAllOrders)

// /api/v1/order/single -> to get single order
app.route("/:id").get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder)



export default app;
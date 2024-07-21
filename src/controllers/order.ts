import { TryCatch } from "../middlewares/error.js";
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/Order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";

// For placing new Order
export const newOrder = TryCatch(async (req: Request<{}, {}, NewOrderRequestBody>, resp, next) => {

    const {
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    } = req.body;

    if (!shippingInfo ||
        !orderItems ||
        !user ||
        !subtotal ||
        !tax ||
        !total) return next(new ErrorHandler("Enter all required Fields", 404));


    await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });

    await reduceStock(orderItems);
    await invalidateCache({ product: true, order: true, admin: true });

    return resp.status(201).json({
        success: true,
        message: "Order Placed Successfully"
    })
})

//to get my orders
export const myOrders = TryCatch(async (req, resp, next) => {

    const { id } = req.query;
    let orders = [];
    // const key = `my-orders-${id}`;

    // if (myCache.has(key)) orders = JSON.parse(myCache.get("") as string);
    // else {
    orders = await Order.find({ user: id });
    // myCache.set("key", JSON.stringify(orders));
    // }
    return resp.json({
        success: true,
        orders,
    });
});

// get all orders for admin
export const getAllOrders = TryCatch(async (req, resp, next) => {

    const key = "all-orders";
    let orders = [];

    if (myCache.has(key)) orders = JSON.parse(myCache.get("") as string);
    else {
        orders = await Order.find().populate("user", "name");
        myCache.set("key", JSON.stringify(orders));
    }
    return resp.status(200).json({
        success: true,
        orders,
    });
});

// get single order
export const getSingleOrder = TryCatch(async (req, resp, next) => {

    const { id } = req.params;

    const key = `order-${id}`;

    let order;

    if (myCache.has(key)) order = JSON.parse(myCache.get("") as string);
    else {
        order = await Order.findById(id).populate("user", "name");
        if (!order) return next(new ErrorHandler("Order Not Found", 404));
        myCache.set("key", JSON.stringify(order));
    }
    return resp.status(200).json({
        success: true,
        order,
    });
});


export const processOrder = TryCatch(
    async (req, resp, next) => {

        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return next(new ErrorHandler("Order Not Found", 404));
        }

        switch (order.status) {
            case "Processing":
                order.status = "Shipped";
                break;
            case "Shipped":
                order.status = "Delivered";
                break;
            default:
                order.status = "Delivered"
        }
        await order.save();

        await invalidateCache({ product: false, order: true, admin: true });

        return resp.status(200).json({
            success: true,
            message: "Order Processed Successfully"
        })
    }
);

export const deleteOrder = TryCatch(async (req, resp, next) => {

    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.deleteOne();

    await invalidateCache({ product: false, order: true, admin: true });

    return resp.status(200).json({
        success: true,
        message: "Order deleted successfully"
    })

})
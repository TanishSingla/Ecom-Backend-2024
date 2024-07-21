import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";


export const connectDB = (uri: string) => {

    mongoose.connect(uri, {
        dbName: "Ecommerce_With_Admin_Dashboard"
    }).then((conn) => {
        console.log(`Database Connected Successfully to ${conn.connection.host}`)
    }).catch(e => console.log(e));
};

//function to clear cache
export const invalidateCache = async ({ product, order, admin }: InvalidateCacheProps) => {

    if (product) {
        const productKeys: string[] = [
            "latest-product",
            "categories",
            "admin-products"
        ];

        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys: string[] = ["all-orders"];
        const orders = await Order.find({}).select("_id");

        orders.forEach((i) => {
            orderKeys.push(`order-${i._id}`);
        })

        myCache.del(orderKeys);
    }
    if (admin) {
        const adminKeys = [
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts"
        ]
        myCache.del(adminKeys);
    }

}

//function for reducing product stock while placing order for any product

export const reduceStock = async (orderItems: OrderItemType[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);

        if (!product) {
            throw new Error("Product Not Found");
        } else {
            product.stock -= order.quantity;
            await product.save();
        }
    }
};


export const calculatePercentage = (thisMonth: number, lastMonth: number) => {

    //for calculating relative percentage
    if (lastMonth === 0) return thisMonth * 100;
    const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0));

}
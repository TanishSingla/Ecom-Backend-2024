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
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));

}

export const GetInventory = async ({ categories, productCount }: { categories: string[], productCount: number }) => {

    const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }))

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((cat, i) => {
        categoryCount.push({
            [cat]: Math.round((categoriesCount[i] / productCount) * 100),
        })
    })
    return categoryCount;
}


interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}
type FuncProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
};

export const getChartData = ({
    length,
    docArr,
    today,
    property,
}: FuncProps) => {
    const data: number[] = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            if (property) {
                data[length - monthDiff - 1] += i[property]!;
            } else {
                data[length - monthDiff - 1] += 1;
            }
        }
    });

    return data;
};
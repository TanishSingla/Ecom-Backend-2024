import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { calculatePercentage } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, resp, next) => {


    let stats;

    if (myCache.has("admin-stats")) {
        stats = JSON.parse(myCache.get("admin-stats") as string);
    } else {

        const today = new Date();
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
            ),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        };

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        /*--------------Product-----------*/

        //Finding Product created in current month
        const thisMonthProductPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        //Finding Product created in last month
        const lastMonthProductPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        /*--------------Users-----------*/

        //Finding User of current month
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        //Finding User of in last month
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        /*--------------Orders-----------*/

        //Finding User of current month
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        //Finding User of in last month
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        });

        const latestTransactionsPrmoise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            productCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransactions
        ] = await Promise.all(
            [
                thisMonthProductPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthOrdersPromise,
                lastMonthProductPromise,
                lastMonthUsersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total"),
                lastSixMonthOrdersPromise,
                Product.distinct("category"),
                User.countDocuments({ gender: "female" }),
                latestTransactionsPrmoise
            ]);


        const thisMonthRevenue = thisMonthOrders.reduce(
            (total, currOrder) => total + (currOrder.total || 0), 0
        );

        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, currOrder) => total + (currOrder.total || 0), 0
        );

        const changePercent = {
            revenue: calculatePercentage(
                thisMonthRevenue,
                lastMonthRevenue
            ),
            product: calculatePercentage(
                thisMonthProducts.length,
                lastMonthProducts.length
            ),
            orders: calculatePercentage(
                thisMonthOrders.length,
                lastMonthOrders.length
            ),
            products: calculatePercentage(
                thisMonthUsers.length,
                lastMonthUsers.length
            ),
        };

        const revenue = allOrders.reduce((acc, order) =>
            acc + (order.total || 0), 0);

        const counts = {
            revenue,
            product: productCount,
            user: usersCount,
            order: allOrders.length
        }

        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = today.getMonth() - creationDate.getMonth();

            if (monthDiff < 6) {
                orderMonthCounts[5 - monthDiff] += 1;
                orderMonthlyRevenue[5 - monthDiff] += order.total;
            }
        });

        const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }))

        const categoriesCount = await Promise.all(categoriesCountPromise);

        const categoryCount: Record<string, number>[] = [];

        categories.forEach((cat, i) => {
            categoryCount.push({
                [cat]: Math.round((categoriesCount[i] / productCount) * 100),
            })
        })

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount
        }

        const modifiedLatestTransaction = latestTransactions.map((i) => ({
            id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }))

        stats = {
            categoryCount,
            changePercent,
            counts,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },
            userRatio,
            latestTransactions: modifiedLatestTransaction
        };

        myCache.set("admin-stats", JSON.stringify(stats));
    }

    return resp.status(200).json({
        suceess: true,
        stats
    })
})


export const getPieCharts = TryCatch(async (req, resp, next) => {

    let charts;

    if (myCache.has("admin-pieChart")) {
        charts = JSON.parse(myCache.get("admin-pieChart") as string);
    } else {

        const [processingOrder, shippedOrder, deliveredOrder]
            = await Promise.all([
                Order.countDocuments({ status: "Processing" }),
                Order.countDocuments({ status: "Shipped" }),
                Order.countDocuments({ status: "Delivered" }),
            ]);

        const orderFullfillmentRatio = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        };

        charts = {
            orderFullfillmentRatio
        }
        myCache.set("admin-pieChart", JSON.stringify(charts));
    }

    return resp.status(200).json({
        success: true,
        charts
    })

})
export const getBarCharts = TryCatch(async (req, resp, next) => {

})
export const getLineCharts = TryCatch(async (req, resp, next) => {

})
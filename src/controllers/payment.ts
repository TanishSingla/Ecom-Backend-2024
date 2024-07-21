import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/Coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const newCoupon = TryCatch(async (req, resp, next) => {
    const { coupon, amount } = req.body;

    if (!coupon || !amount)
        return next(new ErrorHandler("Please enter both coupon and amount", 400));

    await Coupon.create({ coupon, amount });

    return resp.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`,
    });
});

export const applyDiscount = TryCatch(async (req, resp, next) => {
    const { coupon } = req.query;

    const discount = await Coupon.findOne({ coupon });

    if (!discount) return next(new ErrorHandler("Invalid Coupon coupon", 400));

    return resp.status(200).json({
        success: true,
        discount: discount.amount,
    });
});

export const allCoupons = TryCatch(async (req, resp, next) => {
    const coupons = await Coupon.find({});

    return resp.status(200).json({
        success: true,
        coupons,
    });
});

export const getCoupon = TryCatch(async (req, resp, next) => {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

    return resp.status(200).json({
        success: true,
        coupon,
    });
});



export const deleteCoupon = TryCatch(async (req, resp, next) => {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

    return resp.status(200).json({
        success: true,
        message: `Coupon ${coupon.coupon} Deleted Successfully`,
    });
});
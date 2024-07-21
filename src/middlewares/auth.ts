import { User } from "../models/User.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

// Middleware to check only admins
// can acess some specific routes...

export const adminOnly = TryCatch(async (req, resp, next) => {

    const { id } = req.query;

    if (!id) {
        return next(new ErrorHandler("Please Login First...", 401));
    }

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("Not Registered...", 401));
    }

    if (user.role !== "admin") {
        return next(new ErrorHandler("Not Authorized to access...", 401));
    }

    //else we will call next handler
    next();
})
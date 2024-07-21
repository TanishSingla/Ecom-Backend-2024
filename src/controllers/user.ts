import { Request, Response, NextFunction } from "express";
import { NewUserRequestBody } from "../types/types.js";
import { User } from "../models/User.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";

//Create New User
export const newUser = TryCatch(async (
    req: Request<{}, {}, NewUserRequestBody>,
    resp: Response,
    next: NextFunction
) => {

    const { name, email, photo, gender, _id, dob } = req.body;

    if (!_id || !email || !gender || !dob || !name) {
        return next(new ErrorHandler("Please add all fields", 400));
    }

    //checking if user already exists.. 
    let user = await User.findById(_id);

    //then we will simply just logIn
    if (user) {
        return resp.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`
        });
    };

    //create user
    user = await User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob),
    });

    return resp.status(201).json({
        success: true,
        message: `User Created Successfully, Welcome ${user.name}`
    })
});

//Get All User 
export const getAllUsers = TryCatch(async (req, resp, next) => {
    const users = await User.find({});
    return resp.status(200).json({
        success: true,
        users
    })
});


//Get Single User by _id 
export const getUser = TryCatch(async (req, resp, next) => {

    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler("Invalid Id", 400));

    return resp.status(200).json({
        success: true,
        user
    })
});

//Delete User by _id 
export const deleteUser = TryCatch(async (req, resp, next) => {

    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler("Invalid Id", 400));

    await user.deleteOne();

    return resp.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    })
})
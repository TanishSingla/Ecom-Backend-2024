import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/utility-class.js';
import { ControllerType } from '../types/types.js';

export const errorMiddleware = (
    err: ErrorHandler,
    req: Request,
    resp: Response,
    next: NextFunction
) => {

    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    if (err.name = "CastError") {
        err.message = "Invalid ID";
    }

    return resp.status(err.statusCode).json({
        success: true,
        message: err.message
    })
};

export const TryCatch = (func: ControllerType) => {
    return ((req: Request, resp: Response, next: NextFunction) => {
        return Promise.resolve(func(req, resp, next)).catch(next);
    })
}
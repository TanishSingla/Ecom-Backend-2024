import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/Product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";


// Create new Product
export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, resp: Response, next: NextFunction) => {

    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) {
        return next(new ErrorHandler("Please Add Photo", 404));
    }
    if (!name || !price || !stock || !category) {
        rm(photo.path, () => {
            console.log("Photo Deleted")
        })
        return next(new ErrorHandler("Please Enter All Feilds", 404));
    }

    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo?.path
    });

    //clearing cache
    await invalidateCache({ product: true });

    return resp.status(201).json({
        success: true,
        message: "Product Created Successfully"
    });

});


// Get Lates product...
export const getLatestProducts = TryCatch(async (req, resp, next) => {

    //saving latest product in cache
    //Revalidate it on create,update and delete and NewOrder also.
    let products;

    if (myCache.has("latest-product")) {
        products = JSON.parse(myCache.get("latest-product") as string);
    } else {
        products = await Product
            .find({})
            .sort({ createdAt: 1 })
            .limit(5);
        console.log("Cached");
        myCache.set("latest-product", JSON.stringify(products));
    }

    return resp.status(200).json({
        success: true,
        message: "Latest Products Fetched Successfully",
        products
    })
});

//get all unique categories
export const getAllCategories = TryCatch(async (req, resp, next) => {
    let categories;
    //Cache
    //Revalidate it on create,update and delete and NewOrder also.

    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories") as string);
    } else {
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify({
            categories
        }))
    }

    return resp.json({
        success: true,
        categories,
    })

})

// Get all products for admin view
export const getAdminProducts = TryCatch(async (req, resp, next) => {
    let products;
    if (myCache.has("admin-products")) {
        products = JSON.parse(myCache.get("admin-products") as string);
    } else {
        products = await Product.find({});
        myCache.set("admin-products", JSON.stringify({
            products
        }))
    }

    return resp.status(200).json({
        success: true,
        message: "Products Fetched Successfully",
        products
    })
});


// Get single Product
export const getSingleProduct = TryCatch(async (req, resp, next) => {

    // let product;
    // const id = req.params.id;

    // if (myCache.has(`product-${id}`)) {
    //     product = JSON.parse(myCache.get(`product-${id}`) as string);
    // } else {
    //     product = await Product.findById(id);
    //     myCache.set(`product-${id}`, JSON.stringify({
    //         product
    //     }))
    // }

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Invalid Product ID", 404));
    };
    return resp.status(200).json({
        success: true,
        message: "Products Fetched Successfully",
        product
    })
});

//update Product
export const updateProduct = TryCatch(async (req, resp, next) => {

    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);


    if (!product) {
        return next(new ErrorHandler("Invalid Product ID", 404));
    }


    if (photo) {
        rm(product.photo!, () => {
            console.log("Old Photo Deleted")
        });
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();

    //clearing cache
    await invalidateCache({ product: true });

    return resp.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    });
});

//delete single product
export const deleteProduct = TryCatch(async (req, resp, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Invalid Product ID", 404));
    };

    rm(product.photo!, () => {
        console.log("Product Photo Deleted")
    });
    await Product.deleteOne();

    //clearing cache
    await invalidateCache({ product: true });

    return resp.status(200).json({
        success: true,
        message: "Products Deleted Successfully",
        product
    })
});


//search Product
export const searchProduct = TryCatch(async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    resp,
    next
) => {

    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);

    const baseQuery: BaseQuery = {};

    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: "i",
        }
    }

    if (price) {
        baseQuery.price = {
            $lte: Number(price),
        }
    }

    if (category) {
        baseQuery.category = category
    }

    const products = await Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

    const allFilteredProducts = await Product.find(baseQuery);

    const totalPages =
        Math.ceil(allFilteredProducts.length / limit);

    return resp.status(200).json({
        success: true,
        products,
        totalPages,
    })
})
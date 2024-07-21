import mongoose, { mongo } from "mongoose";



const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter Name"]
    },
    photo: {
        type: String,
        required: [true, "Please add a Photo"]
    },
    price: {
        type: Number,
        required: [true, "Please enter price"]
    },
    stock: {
        type: Number,
        required: [true, "Please Enter stock of the Product"]
    },
    category: {
        type: String,
        required: [true, "Please Enter Category of Product"],
        trim: true,
    }
},
    {
        timestamps: true,
    }
);


export const Product = mongoose.model('Product', schema);
import express from 'express';
import { adminOnly } from '../middlewares/auth.js';
import { deleteProduct, getAdminProducts, getAllCategories, getLatestProducts, getSingleProduct, newProduct, searchProduct, updateProduct } from '../controllers/product.js';
import { singleUpload } from '../middlewares/multer.js';


const app = express.Router();

//create new Product - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);

//get lates Products - /api/v1/product/lates
app.get("/latest", getLatestProducts);

//search products - /api/v1/product/search
app.get("/all", searchProduct);

//get all unique categroeis - /api/v1/product/categories
app.get("/categories", getAllCategories);

//get all Products for admin  - /api/v1/product/admin-products
app.get("/admin-products", adminOnly, getAdminProducts);

//get product, update product and delete product by ID.
app.route("/:id").get(getSingleProduct).put(adminOnly, updateProduct).delete(adminOnly, deleteProduct);



export default app;
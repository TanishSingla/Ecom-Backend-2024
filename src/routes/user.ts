import express from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();


//route 

// /api/v1/user/new
app.post("/new", newUser);

// /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);

// /api/v1/user/{dynamicId}
app.route("/:id").get(getAllUsers).delete(adminOnly, deleteUser);



export default app;
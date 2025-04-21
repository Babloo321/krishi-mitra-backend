import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middlewares.js'
import { addToCart, removeFromCart, getCartDetails } from '../controllers/Cart.controller.js';
const cartRouter = Router();
cartRouter.route("/addToCart/:productId").post(verifyJWT, addToCart);
cartRouter.route("/removeToCart/:productId").patch(verifyJWT, removeFromCart);
cartRouter.route("/getAllCart").get(verifyJWT, getCartDetails);
export default cartRouter;
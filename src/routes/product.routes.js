import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middlewares.js'
import { upload } from "../middlewares/multer.middleware.js";
import { addProduct, deleteProduct,getProducts } from "../controllers/Product.Controller.js";
const productRouter = Router();
productRouter.route("/addProduct").post(
  verifyJWT,
  upload.single("image"),
  addProduct
);
productRouter.route("/delete/:ids").delete(verifyJWT, deleteProduct);
productRouter.route("/getProducts").get(verifyJWT, getProducts);
export default productRouter;
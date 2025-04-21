import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middlewares.js'
import { upload } from "../middlewares/multer.middleware.js";
import { addProduct, deleteProduct,getProducts, getSeedsAndFertilizers } from "../controllers/Product.Controller.js";
import { handleProductRequest, handleProductRequestQuery } from '../controllers/ProductRequest.controller.js';
const productRouter = Router();
productRouter.route("/addProduct").post(
  verifyJWT,
  upload.single("image"),
  addProduct
);
productRouter.route("/delete/:ids").delete(verifyJWT, deleteProduct);
productRouter.route("/getProducts").get(verifyJWT, getProducts);
productRouter.route("/getSeedsAndFertilizers").get(verifyJWT, getSeedsAndFertilizers);



// product request handler
productRouter.route("/user/request/query/:id").get(verifyJWT,handleProductRequestQuery)
productRouter.route("/user/request/:id").post(verifyJWT, handleProductRequest);
export default productRouter;
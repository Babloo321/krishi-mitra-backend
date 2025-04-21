import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
const allowedOrigins = ["https://krishi-mitra-client.vercel.app","http://localhost:5173"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({limit:"16kb",extended:true}));  // when data comes to the url, it will be in json format,extended makes it nested(you can send nested data in url)
app.use(express.static("public"));    // to store static data use a seperate folder to store data folder name is anything
app.use(cookieParser());    // to store data in cookies of user data to retrive user data and stored in cookies it coulde be working with server only

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

import userRouter from './routes/user.routes.js'
app.use("/api/v2/user",userRouter)

// farmer details route handler
import farmerDetailsRoute from './routes/farmerDetails.routes.js';
app.use("/api/v2/farmer",farmerDetailsRoute);

// product route handler
import productRouter from './routes/product.routes.js';
app.use("/api/v2/product", productRouter);

// admin router handler
import adminRouter from './routes/admin.routes.js';
app.use("/api/v2/admin",adminRouter);

import cartRouter from './routes/cart.routes.js';
app.use("/api/v2/cart",cartRouter);
export default app;

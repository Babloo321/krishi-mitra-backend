// routes/farmerDetailsRoutes.js
import express from 'express';
import { farmerDetails, getFarmerDetails } from '../controllers/FarmerDetails.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const farmerDetailsRoute = express.Router();

// POST farmer details from client
farmerDetailsRoute.route('/submit/info').post(verifyJWT, farmerDetails)
farmerDetailsRoute.route('/get/info').get(verifyJWT, getFarmerDetails)

export default farmerDetailsRoute;

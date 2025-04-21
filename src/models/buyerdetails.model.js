import mongoose from "mongoose";
const buyerDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  companyName:{
    type:String,
    required:true
  },
  location: {
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });
// Export to use in user schema
export default buyerDetailsSchema;

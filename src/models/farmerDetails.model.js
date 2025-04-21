import mongoose from 'mongoose';

const farmerDetailsSchema = new mongoose.Schema({
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
  location: {
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  landSize: {
    type: String,
  },
  cropsGrown: {
    type: [String], // ✅ Array of strings
    validate: [Array.isArray, 'Crops must be an array of strings'],
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const FarmerDetail = mongoose.model("FarmerDetails", farmerDetailsSchema);

export default FarmerDetail;

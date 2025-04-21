import mongoose from 'mongoose';

const productRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    message: {
      type: [String], // ✅ changed from String to array of Strings
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);
export default ProductRequest;

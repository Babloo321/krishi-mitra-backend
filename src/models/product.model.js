import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: { type: String, required: true,unique:true },
  image: {type: String},
  imagePublicId: {type:String},
  price: { type: Number, required: true },
  description: { type: String },
  brand: { type: String },
  productType: { type: String },
  color: { type: String },
  maxShelfLife: { type: String }, // e.g. "6 months"
  nutrientContent: { type: String },
  countryOfOrigin: { type: String },
  quantity: { type: Number, default: 0 },
  expiry: { type: Date },
  owner: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;

// models/Product.js
import mongoose from 'mongoose';

const ourProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // prevents duplicates by name
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: String,
  description: String
}, {
  timestamps: true
});

export const OurProduct = mongoose.model('OurProduct', ourProductSchema);

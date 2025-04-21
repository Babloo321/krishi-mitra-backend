import mongoose from "mongoose";

// This schema stores credit info for farmers
const creditSchema = new mongoose.Schema({
  currentLoan: {
    type: Number,
    default: 0, // By default, no loan
  },
  issueDate: Date, // Date when loan was given
  repaymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending', // Default is pending
  },
  interestRate: {
    type: Number,
    default: 0, // Default interest rate
  },
  paymentDue: Date, // Due date to pay loan
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' matches the name you used in mongoose.model('User', ...)
    required: true,
  },
});

const Credit = mongoose.model("Credit", creditSchema);
export default Credit;

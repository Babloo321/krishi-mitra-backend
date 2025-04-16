import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
  // Login/Auth Info
  userName: {
    type: String,
    required: function () { return !this.isGoogleAuth; }, // Required if not using Google Login
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () { return !this.isGoogleAuth; }, // Not required for Google Auth
  },
  isGoogleAuth: {
    type: Boolean,
    default: false,
  },
  refreshToken: String, // Used for login sessions

  picture: String,   // Profile image URL
  pictureId: String, // Cloudinary ID or filename

  role: {
    type: String,
    required:true
  },

}, { timestamps: true });



// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ userName: 1 }, { unique: true });
userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt);
});


userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id:this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

userSchema.methods.generateRefreshTokenToken = function(){
  return jwt.sign(
    {
      _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password)
}
const User = mongoose.model('User', userSchema);

export default User;

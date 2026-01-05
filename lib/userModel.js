// lib/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String, 
  shopifyCustomerId: { type: String, unique: true, sparse: true }, 
});

export default mongoose.models.User || mongoose.model("User", userSchema);
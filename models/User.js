import mongoose from 'mongoose';
import { UserRoles } from './enums.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRoles), required: true, index: true },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.model('User', UserSchema);

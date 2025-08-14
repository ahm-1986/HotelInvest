import mongoose from 'mongoose';
import { OnboardingStatus, UserRoles } from './enums.js';
import User from './User.js';

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  location: { type: String, trim: true },
  description: { type: String, trim: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // hotel_admin
  onboarding_status: { type: String, enum: Object.values(OnboardingStatus), default: OnboardingStatus.PENDING, index: true },
  due_diligence_notes: { type: String, trim: true },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // platform_admin
  approved_at: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

HotelSchema.path('owner_id').validate(async function (val) {
  const u = await User.findById(val).lean();
  return !!u && u.role === UserRoles.HOTEL_ADMIN;
}, 'owner_id must reference a user with role=hotel_admin');

HotelSchema.path('approved_by').validate(async function (val) {
  if (!val) return true;
  const u = await User.findById(val).lean();
  return !!u && u.role === UserRoles.PLATFORM_ADMIN;
}, 'approved_by must reference a user with role=platform_admin');

export default mongoose.model('Hotel', HotelSchema);

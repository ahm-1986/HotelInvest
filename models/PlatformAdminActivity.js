import mongoose from 'mongoose';
import { UserRoles } from './enums.js';
import User from './User.js';

const PlatformAdminActivitySchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
}, { versionKey: false });

PlatformAdminActivitySchema.path('admin_id').validate(async function (val) {
  const u = await User.findById(val).lean();
  return !!u && u.role === UserRoles.PLATFORM_ADMIN;
}, 'admin_id must reference a user with role=platform_admin');

export default mongoose.model('PlatformAdminActivity', PlatformAdminActivitySchema);

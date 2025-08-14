import mongoose from 'mongoose';
import { OfferStatus, RiskStatus, UserRoles } from './enums.js';
import User from './User.js';

const InvestmentOfferSchema = new mongoose.Schema({
  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
  total_rooms: { type: Number, required: true, min: 1 },
  offered_rooms: { type: Number, required: true, min: 0 },
  price_per_room: { type: Number, required: true, min: 0 },
  roi_percentage: { type: Number, required: true, min: 0 },
  risk_status: { type: String, enum: Object.values(RiskStatus), required: true },
  repayment_plan: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON/text
  status: { type: String, enum: Object.values(OfferStatus), default: OfferStatus.OPEN, index: true },
  created_at: { type: Date, default: Date.now },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { versionKey: false });

InvestmentOfferSchema.path('approved_by').validate(async function (val) {
  if (!val) return true;
  const u = await User.findById(val).lean();
  return !!u && u.role === UserRoles.PLATFORM_ADMIN;
}, 'approved_by must reference a user with role=platform_admin');

// Sanity: offered_rooms cannot exceed total_rooms
InvestmentOfferSchema.pre('validate', function (next) {
  if (this.offered_rooms > this.total_rooms) {
    return next(new Error('offered_rooms cannot exceed total_rooms'));
  }
  next();
});

export default mongoose.model('InvestmentOffer', InvestmentOfferSchema);

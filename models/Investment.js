import mongoose from 'mongoose';
import { InvestmentStatus, UserRoles } from './enums.js';
import User from './User.js';

const InvestmentSchema = new mongoose.Schema({
  investor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentOffer', required: true, index: true },
  rooms_purchased: { type: Number, required: true, min: 1 },
  total_amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: Object.values(InvestmentStatus), default: InvestmentStatus.PENDING, index: true },
  investment_date: { type: Date, default: Date.now },
}, { versionKey: false });

InvestmentSchema.path('investor_id').validate(async function (val) {
  const u = await User.findById(val).lean();
  return !!u && u.role === UserRoles.INVESTOR;
}, 'investor_id must reference a user with role=investor');

export default mongoose.model('Investment', InvestmentSchema);

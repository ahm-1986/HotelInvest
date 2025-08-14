import mongoose from 'mongoose';

const RepaymentSchema = new mongoose.Schema({
  investment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true, index: true },
  wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  payment_date: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.model('Repayment', RepaymentSchema);

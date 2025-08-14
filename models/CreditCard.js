import mongoose from 'mongoose';

const CreditCardSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  card_token: { type: String, required: true },   // tokenized, never store PAN
  card_type: { type: String, trim: true },        // e.g., "visa", "mastercard"
  expiry_date: { type: String, required: true },  // MM/YY or YYYY-MM
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.model('CreditCard', CreditCardSchema);

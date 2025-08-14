import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'OMR', maxlength: 8 },
  last_updated: { type: Date, default: Date.now },
}, { timestamps: { createdAt: false, updatedAt: 'last_updated' }, versionKey: false });

// 1:1 enforcement via unique index on user_id
WalletSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.model('Wallet', WalletSchema);

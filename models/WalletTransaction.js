import mongoose from 'mongoose';
import { TxType, TxStatus, TxSourceType } from './enums.js';

const sourceRefMap = {
  credit_card: 'CreditCard',
  repayment: 'Repayment',
  platform: null,      // platform system event, no ref
  investment: 'Investment',
};

const WalletTransactionSchema = new mongoose.Schema({
  wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: Object.values(TxType), required: true },
  status: { type: String, enum: Object.values(TxStatus), default: TxStatus.PENDING, index: true },

  source_type: { type: String, enum: Object.values(TxSourceType), required: true },
  source_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'source_model',
    default: null,
  },
  source_model: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // must align with source_type
        const expected = sourceRefMap[this.source_type];
        return (expected === null && v === null) || expected === v;
      },
      message: 'source_model must correspond to source_type',
    },
  },

  timestamp: { type: Date, default: Date.now },
}, { versionKey: false });

// derive source_model automatically
WalletTransactionSchema.pre('validate', function (next) {
  const model = sourceRefMap[this.source_type] ?? null;
  this.source_model = model;
  if (model === null) this.source_id = null;
  next();
});

export default mongoose.model('WalletTransaction', WalletTransactionSchema);

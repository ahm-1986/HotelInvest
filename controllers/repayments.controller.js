import mongoose from 'mongoose';
import Repayment from '../models/Repayment.js';
import Wallet from '../models/Wallet.js';
import Investment from '../models/Investment.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { TxType, TxStatus, TxSourceType } from '../models/enums.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createRepayment = asyncHandler(async (req, res) => {
  const { investment_id, wallet_id, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Amount must be > 0' });

  const session = await mongoose.startSession();
  let repayment;
  await session.withTransaction(async () => {
    const inv = await Investment.findById(investment_id).session(session);
    if (!inv) throw new Error('Investment not found');

    const wallet = await Wallet.findById(wallet_id).session(session);
    if (!wallet) throw new Error('Wallet not found');

    // Credit wallet
    wallet.balance += amount;
    await wallet.save({ session });

    // Repayment record
    repayment = await Repayment.create([{
      investment_id, wallet_id, amount, payment_date: new Date(),
    }], { session });
    repayment = repayment[0];

    // Wallet transaction
    await WalletTransaction.create([{
      wallet_id: wallet._id,
      amount,
      type: TxType.REPAYMENT,
      status: TxStatus.COMPLETED,
      source_type: TxSourceType.REPAYMENT,
      source_id: repayment._id,
      timestamp: new Date(),
    }], { session });
  });

  session.endSession();
  res.status(201).json(repayment);
});

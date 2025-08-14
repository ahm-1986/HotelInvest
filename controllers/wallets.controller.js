import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import CreditCard from '../models/CreditCard.js';
import { TxStatus, TxType, TxSourceType } from '../models/enums.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user_id: req.params.userId });
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
  res.json(wallet);
});

// Simulated card top-up (card must belong to the same user)
export const cardTopup = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { card_id, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Amount must be > 0' });

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const wallet = await Wallet.findOne({ user_id: userId }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    const card = await CreditCard.findOne({ _id: card_id, user_id: userId }).session(session);
    if (!card) throw new Error('Card not found or not owned by user');

    wallet.balance += amount;
    await wallet.save({ session });

    await WalletTransaction.create([{
      wallet_id: wallet._id,
      amount,
      type: TxType.CARD_TOPUP,
      status: TxStatus.COMPLETED,
      source_type: TxSourceType.CREDIT_CARD,
      source_id: card._id,
      timestamp: new Date(),
    }], { session });
  });

  session.endSession();
  res.status(201).json({ ok: true });
});

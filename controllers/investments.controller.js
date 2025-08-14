import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Investment from '../models/Investment.js';
import InvestmentOffer from '../models/InvestmentOffer.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { InvestmentStatus, OfferStatus, TxType, TxStatus, TxSourceType } from '../models/enums.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createInvestment = asyncHandler(async (req, res) => {
  const { investor_id, offer_id, rooms_purchased, total_amount } = req.body;

  const session = await mongoose.startSession();
  let investment;
  await session.withTransaction(async () => {
    const wallet = await Wallet.findOne({ user_id: investor_id }).session(session);
    if (!wallet) throw new Error('Wallet not found for investor');
    if (wallet.balance < total_amount) throw new Error('Insufficient wallet balance');

    const offer = await InvestmentOffer.findById(offer_id).session(session);
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== OfferStatus.OPEN) throw new Error('Offer not open');
    if (rooms_purchased <= 0) throw new Error('rooms_purchased must be > 0');
    if (offer.offered_rooms + rooms_purchased > offer.total_rooms) {
      throw new Error('Purchase exceeds available rooms in offer');
    }

    // Debit wallet
    wallet.balance -= total_amount;
    await wallet.save({ session });

    // Create investment
    investment = await Investment.create([{
      investor_id, offer_id, rooms_purchased, total_amount,
      status: InvestmentStatus.CONFIRMED, // assuming instant confirmation
      investment_date: new Date(),
    }], { session });
    investment = investment[0];

    // Wallet transaction
    await WalletTransaction.create([{
      wallet_id: wallet._id,
      amount: total_amount,
      type: TxType.INVESTMENT,
      status: TxStatus.COMPLETED,
      source_type: TxSourceType.INVESTMENT,
      source_id: investment._id,
      timestamp: new Date(),
    }], { session });

    // Progress the offer
    offer.offered_rooms += rooms_purchased;
    if (offer.offered_rooms === offer.total_rooms) {
      offer.status = OfferStatus.FUNDED;
    }
    await offer.save({ session });
  });

  session.endSession();
  res.status(201).json(investment);
});

export const listInvestments = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.investor_id) q.investor_id = req.query.investor_id;
  if (req.query.offer_id) q.offer_id = req.query.offer_id;
  const items = await Investment.find(q).limit(200);
  res.json(items);
});

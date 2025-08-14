import InvestmentOffer from '../models/InvestmentOffer.js';
import { OfferStatus } from '../models/enums.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createOffer = asyncHandler(async (req, res) => {
  // offered_rooms <= total_rooms handled by schema
  const offer = await InvestmentOffer.create(req.body);
  res.status(201).json(offer);
});

export const listOffers = asyncHandler(async (_req, res) => {
  const offers = await InvestmentOffer.find().limit(200);
  res.json(offers);
});

export const closeOffer = asyncHandler(async (req, res) => {
  const offer = await InvestmentOffer.findByIdAndUpdate(
    req.params.id,
    { status: OfferStatus.CLOSED },
    { new: true }
  );
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  res.json(offer);
});

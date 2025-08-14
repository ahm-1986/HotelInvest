import Hotel from '../models/Hotel.js';
import { OnboardingStatus } from '../models/enums.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createHotel = asyncHandler(async (req, res) => {
  // owner_id must be a hotel_admin (validated by schema)
  const hotel = await Hotel.create(req.body);
  res.status(201).json(hotel);
});

export const listHotels = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find().limit(200);
  res.json(hotels);
});

export const approveHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hotel = await Hotel.findById(id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
  hotel.onboarding_status = OnboardingStatus.APPROVED;
  hotel.approved_by = req.user?._id || null; // platform_admin enforced by route
  hotel.approved_at = new Date();
  await hotel.save();
  res.json(hotel);
});

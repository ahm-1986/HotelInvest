import Room from '../models/Room.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json(room);
});

export const listRoomsByHotel = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ hotel_id: req.params.hotelId }).limit(500);
  res.json(rooms);
});

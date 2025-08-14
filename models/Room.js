import mongoose from 'mongoose';
import { RoomStatus } from './enums.js';

const RoomSchema = new mongoose.Schema({
  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
  room_number: { type: String, required: true, trim: true },
  type: { type: String, trim: true },      // e.g., "Deluxe", "Suite"
  base_price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: Object.values(RoomStatus), default: RoomStatus.AVAILABLE, index: true },
}, { timestamps: true, versionKey: false });

RoomSchema.index({ hotel_id: 1, room_number: 1 }, { unique: true });

export default mongoose.model('Room', RoomSchema);

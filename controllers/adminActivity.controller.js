import PlatformAdminActivity from '../models/PlatformAdminActivity.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const logAdminAction = asyncHandler(async (req, res) => {
  const item = await PlatformAdminActivity.create({
    admin_id: req.user?._id,
    action: req.body.action,
    timestamp: new Date(),
  });
  res.status(201).json(item);
});

export const listAdminActions = asyncHandler(async (_req, res) => {
  const items = await PlatformAdminActivity.find().sort({ timestamp: -1 }).limit(200);
  res.json(items);
});

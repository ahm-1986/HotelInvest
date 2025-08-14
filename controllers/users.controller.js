import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().limit(200);
  res.json(users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ ok: true });
});

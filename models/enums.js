export const UserRoles = Object.freeze({
  INVESTOR: 'investor',
  HOTEL_ADMIN: 'hotel_admin',
  PLATFORM_ADMIN: 'platform_admin',
});

export const OnboardingStatus = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const RoomStatus = Object.freeze({
  AVAILABLE: 'available',
  SOLD: 'sold',
  RESERVED: 'reserved',
});

export const OfferStatus = Object.freeze({
  OPEN: 'open',
  FUNDED: 'funded',
  CLOSED: 'closed',
});

export const RiskStatus = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

export const InvestmentStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REFUNDED: 'refunded',
});

export const TxType = Object.freeze({
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  INVESTMENT: 'investment',
  REPAYMENT: 'repayment',
  CARD_TOPUP: 'card_topup',
  CARD_WITHDRAWAL: 'card_withdrawal',
});

export const TxStatus = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

export const TxSourceType = Object.freeze({
  CREDIT_CARD: 'credit_card',
  REPAYMENT: 'repayment',
  PLATFORM: 'platform',
  INVESTMENT: 'investment',
});

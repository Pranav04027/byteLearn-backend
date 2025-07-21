import { ApiError } from '../utils/ApiError.js';

export const checkRole = (requiredRole) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'No user info'));
  if (req.user.role !== requiredRole) {
    return next(new ApiError(403, 'Access denied because of role conflict. This route is only avilable for instructor'));
  }
  next();
};

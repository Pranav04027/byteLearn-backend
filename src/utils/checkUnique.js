import ApiError from "./ApiError.js";

/**
 * Generic function to check uniqueness
 * @param {Model} model - Mongoose model
 * @param {String} field - Field name to check
 * @param {any} value - Value to match
 * @param {String} [errorMsg] - Custom error message
 */

export const checkUniqueField = async (model, field, value, errorMsg) => {
  const query = {};
  query[field] = value;

  const existing = await model.findOne(query);
  if (existing) {
    throw new ApiError(400, errorMsg || `${field} already exists`);
  }
};

/*
 
*/
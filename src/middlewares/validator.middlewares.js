import Joi from "joi";
import {ApiError} from "../utils/ApiError.js";

/**
 * @param {Object} schemas - An object like { body, params, query, headers }
 */

export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, { abortEarly: false });
      if (error) throw error;
    }

    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, { abortEarly: false });
      if (error) throw error;
    }

    if (schemas.query) {
      const { error } = schemas.query.validate(req.query, { abortEarly: false });
      if (error) throw error;
    }

    if (schemas.headers) {
      const { error } = schemas.headers.validate(req.headers, { abortEarly: false });
      if (error) throw error;
    }

    next();
    
  } catch (err) {
    const messages = err.details?.map((d) => d.message).join(", ");
    next(new ApiError(400, messages || "Validation error"));
  }
};

/*
To validate Multiple: 

router.put(
  "/update/:videoId",
  validate({
    body: videoUploadBody(schemaname),
    params: videoIdParam,
  }),
  updateVideoController
);

*/
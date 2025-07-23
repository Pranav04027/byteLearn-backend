import Joi from "joi"

export const videoUploadSchema = Joi.object(
  {
    title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages(
      {
       'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Title is required',
      }
    ),

  description: Joi.string()
    .allow('')
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  category: Joi.string()
    .required()
    .messages({
      'any.required': 'Category is required',
    }),
  tags: Joi.array()
    .items(Joi.string().min(1))
    .optional()
    .messages({
      'array.base': 'Tags must be an array of strings',
    }),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required()
    .messages({
      'any.only': 'Difficulty must be one of: easy, medium, hard',
      'any.required': 'Difficulty is required',
    }),
});
import Joi from "joi";

export const quizSchemaValidator = Joi.object({
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string()
        .max(400)
        .required()
        .messages({
          'string.max': 'Question length can not be more than 400 characters',
          'string.required': 'Question field can not be empty',
        }),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string()
            .required()
            .max(200)
            .messages({
              'string.max': 'Option length can not be more than 200 characters',
              'string.required': 'Option field can not be empty',
            }),
          isCorrect: Joi.boolean()
            .required()
            .messages({
              'any.required': 'Correctness for each option is necessary',
            }),
        })
      ).min(2).custom((value, helpers) => {
        const trueCount = value.filter(option => option.isCorrect).length;
        if (trueCount !== 1) {
          return helpers.error('any.invalid', { message: 'Exactly one option must be correct' });
        }
        return value;
      }),
    })
  ),
});
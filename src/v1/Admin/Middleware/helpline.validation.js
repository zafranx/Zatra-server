const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

const helplineValidationSchema = Joi.object({
  _id: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow("", null)
    .optional(),

  CityId: Joi.string().required().messages({
    "any.required": "City is required",
    "string.empty": "City cannot be empty",
  }),

  ContactPersonName: Joi.string().required().messages({
    "any.required": "Contact Person Name is required",
    "string.empty": "Contact Person Name cannot be empty",
  }),

  HelplineNumber: Joi.number().required().messages({
    "any.required": "Helpline Number is required",
    "number.base": "Helpline Number must be a number",
  }),
// optional
  Email: Joi.string().email().optional().allow("", null),
  AddressLine1: Joi.string().optional().allow("", null),
  AddressLine2: Joi.string().optional().allow("", null),
  PostalCode: Joi.string().optional().allow("", null),
});

const validateSaveHelpline = (req, res, next) => {
  const { error } = helplineValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }
  next();
};

module.exports = {
  validateSaveHelpline,
};

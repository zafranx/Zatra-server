const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

// Custom Joi ObjectId validator
const objectIdValidator = Joi.string()
  .custom((value, helpers) => {
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .allow(null, "")
  .optional();

// Joi schema
const saveCityContactSchema = Joi.object({
  _id: objectIdValidator,

  CityId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.required": "City is required",
      "any.invalid": "CityId must be a valid ObjectId",
    }),

  ContactTypeId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.required": "Contact Type is required",
      "any.invalid": "ContactTypeId must be a valid ObjectId",
    }),

  ContactName: Joi.string().required().messages({
    "any.required": "Contact Name is required",
    "string.empty": "Contact Name cannot be empty",
  }),

  Designation: Joi.string().optional().allow(""),
  Image: Joi.string().optional().allow(""),
  Phone: Joi.number().optional(),
  Email: Joi.string().email().optional().allow(""),
  Website: Joi.string().uri().optional().allow(""),
  AddressLine1: Joi.string().optional().allow(""),
  AddressLine2: Joi.string().optional().allow(""),
  PostalCode: Joi.string().optional().allow(""),
});

// Middleware
const validateSaveCityContact = (req, res, next) => {
  const { error } = saveCityContactSchema.validate(req.body, {
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
  validateSaveCityContact,
};

const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

const saveDestinationSchema = Joi.object({
  _id: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional(),

  CityId: Joi.string().required().messages({
    "any.required": "City is required",
    "string.empty": "City cannot be empty",
  }),

  DestinationTypeId: Joi.string().required().messages({
    "any.required": "Destination Type is required",
    "string.empty": "Destination Type cannot be empty",
  }),

  Destination: Joi.string().required().messages({
    "any.required": "Destination is required",
    "string.empty": "Destination cannot be empty",
  }),

  ShortDescription: Joi.string().allow("", null).optional(),
  WikiPageLink: Joi.string().uri().allow("", null).optional(),

  Geolocation: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
      "array.length": "Geolocation must contain [longitude, latitude]",
    }),
  })
    .required()
    .messages({
      "any.required": "Geolocation is required",
    }),
});

const validateSaveDestination = async (req, res, next) => {
  const { error } = saveDestinationSchema.validate(req.body, {
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
  validateSaveDestination,
};

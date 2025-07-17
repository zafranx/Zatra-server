const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");

exports.validateSaveDestinationAmenities = async (req, res, next) => {
  const schema = Joi.object({
    _id: Joi.string().optional(),

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
    DestinationId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.required": "Destination is required",
        "any.invalid": "DestinationId must be a valid ObjectId",
      }),
    AmenityTypeId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.required": "AmenityTypeId Type is required",
        "any.invalid": "AmenityTypeId must be a valid ObjectId",
      }),
    Geolocation: Joi.object({
      type: Joi.string().valid("Point").required(),
      coordinates: Joi.array()
        .items(Joi.number())
        .length(2)
        .required()
        .messages({
          "array.length": "Geolocation must contain [longitude, latitude]",
        }),
    })
      .required()
      .messages({
        "any.required": "Geolocation is required",
      }),
    IsActive: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }

  next();
};

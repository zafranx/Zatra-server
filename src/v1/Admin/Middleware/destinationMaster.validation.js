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

  PanchtatvaCategoryId: Joi.string().required().messages({
    "any.required": "Panchtatva Category is required",
    "string.empty": "Panchtatva Category cannot be empty",
  }),

  PanchtatvaSubcategoryId: Joi.string().required().messages({
    "any.required": "Panchtatva Subcategory is required",
    "string.empty": "Panchtatva Subcategory cannot be empty",
  }),

  Destination: Joi.string().required().messages({
    "any.required": "Destination is required",
    "string.empty": "Destination cannot be empty",
  }),

  ShortDescription: Joi.string().allow("", null).optional(),
  Lane: Joi.array()
    .items(
      Joi.object({
        LaneNumber: Joi.string().optional().allow("", null),
        LaneName: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  Hall: Joi.array()
    .items(
      Joi.object({
        HallNumber: Joi.string().optional().allow("", null),
        HallName: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  Floor: Joi.array()
    .items(
      Joi.object({
        FloorNumber: Joi.string().optional().allow("", null),
        FloorName: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  WikiPageLink: Joi.string().allow("", null).optional(),
  //   WikiPageLink: Joi.string().uri().allow("", null).optional(),

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

  PictureGallery: Joi.array().items(Joi.string()).allow("", null).optional(),
  VideoGallery: Joi.array().items(Joi.string()).allow("", null).optional(),
});

const validateSaveDestination = async (req, res, next) => {
  const { error } = saveDestinationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }

  next();
};

module.exports = {
  validateSaveDestination,
};

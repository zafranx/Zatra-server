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
  LongDescription: Joi.string().allow("", null).optional(),
  Lane: Joi.array()
    .items(
      Joi.object({
        LaneNumber: Joi.string().optional().allow("", null),
        LaneName: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  Hall: Joi.array()
    .items(
      Joi.object({
        HallNumber: Joi.string().optional().allow("", null),
        HallName: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  Floor: Joi.array()
    .items(
      Joi.object({
        FloorNumber: Joi.string().optional().allow("", null),
        FloorName: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  EntryFee: Joi.array()
    .items(
      Joi.object({
        FeeCategory: Joi.string().optional().allow("", null),
        FeeAmount: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  WorkingDays: Joi.array()
    .items(Joi.string().optional().allow("", null))
    .allow("", null)
    .optional(),
  OpeningHours: Joi.object({
    OpeningTime: Joi.string().allow("", null).optional(),
    ClosingTime: Joi.string().allow("", null).optional(),
    // ClosingTime: Joi.string().isoDate().allow("", null).optional(),
    LunchHours: Joi.string().allow("", null).optional(),
  })
    .allow("", null)
    .optional(),
  TicketInventoryPerDay: Joi.number().optional().allow("", null),
  InstructionsForVisitors: Joi.string().allow("", null).optional(),
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

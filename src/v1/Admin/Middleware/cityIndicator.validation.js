const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");

exports.validateCityIndicator = async (req, res, next) => {
  // * Reusable ObjectId validation
  const objectId = () =>
    Joi.string()
      .allow("", null)
      .custom((value, helpers) => {
        if (!value) return value; // allow empty/null
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      }, "ObjectId Validation");

  const schema = Joi.object({
    // _id: Joi.string().optional(),
    _id: Joi.string()
      .custom((value, helpers) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .allow(null, "")
      .optional(),

    CityStationId: Joi.string().required().messages({
      "any.required": "CityStation is required",
      "string.empty": "CityStaion cannot be empty",
    }),
    PanchtatvaCategoryId: objectId().optional(),
    Name: Joi.string().allow("", null).optional(),
    ShortDescription: Joi.string().allow("", null).optional(),
    LongDescription: Joi.string().allow("", null).optional(),
    PictureGallery: Joi.array().items(Joi.string().allow("", null)).optional(),
    VideoGallery: Joi.array().items(Joi.string().allow("", null)).optional(),
    // CityIndicatorName: Joi.string().optional().allow(""),
    // CityIndicatorValueUnit: Joi.string().optional().allow(""),
    // CityIndicatorValue: Joi.string().optional().allow(""),
    // CityIndicatorImage: Joi.string().optional().allow(""),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
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

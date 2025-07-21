const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");

exports.validateCityIndicator = async (req, res, next) => {
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

    CityId: Joi.string().required().messages({
      "any.required": "City is required",
      "string.empty": "City cannot be empty",
    }),
    CityIndicatorName: Joi.string().optional().allow(""),
    CityIndicatorValueUnit: Joi.string().optional().allow(""),
    CityIndicatorValue: Joi.string().optional().allow(""),
    CityIndicatorImage: Joi.string().optional().allow(""),
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

const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");

exports.validateSaveAncillaryService = async (req, res, next) => {
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
    ServiceType: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.required": "Service Type is required",
        "any.invalid": "ServiceTypeId must be a valid ObjectId",
      }),
    ServiceProvider: Joi.string().required(),
    AncillaryServiceName: Joi.string().allow("", null),
    Fee: Joi.string().allow("", null),
    PhoneNumber: Joi.string().required(),
    IdNumber: Joi.string().required(),
    IdCardPicture: Joi.string().allow("", null),
    PictureGallery: Joi.array().items(Joi.string()).optional(),
    VideoGallery: Joi.array().items(Joi.string()).optional(),
    IsVerified: Joi.boolean().optional(),
    VerificationReport: Joi.string().allow("", null),
    IsActive: Joi.boolean().optional(),
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
